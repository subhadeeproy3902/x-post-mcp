import readline from "readline/promises";
import { GoogleGenAI, type FunctionCall, type FunctionDeclaration } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { ChatMessage, Tool, ToolResult } from "./types";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const mcpClient = new Client({
  name: "x-post",
  version: "1.0.0",
});

const chatHistory: ChatMessage[] = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let tools: Tool[] = [];
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

console.log("Attempting to connect to MCP server...");

// Add a timeout for the connection attempt
const connectionPromise = mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")));
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error("Connection timeout after 5 seconds")), 5000);
});

Promise.race([connectionPromise, timeoutPromise])
  .then(async () => {
    console.log("Connected to MCP server");

    tools = (await mcpClient.listTools()).tools.map((tool) => {
      if (!tool.inputSchema.properties) {
        throw new Error(`Tool ${tool.name} has no properties defined`);
      }
      const required = Array.isArray(tool.inputSchema.required)
        ? tool.inputSchema.required
        : [];
      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: tool.inputSchema.type,
          properties: tool.inputSchema.properties,
          required,
        },
      };
    });

    chatLoop();
  })
  .catch(error => {
    console.error("Failed to connect to MCP server:", error);
    // Fallback to local mode if server connection fails
    console.log("Falling back to local mode without MCP server...");

    // Define a simple tool for demonstration
    tools = [
      {
        name: "createPost",
        description: "Create a post on X formally known as Twitter",
        parameters: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "The status to post"
            }
          },
          required: ["status"]
        }
      }
    ];

    // Start the chat loop
    chatLoop();
  });

async function chatLoop(toolCall?: FunctionCall): Promise<void> {
  if (toolCall && toolCall.name) {
    console.log("calling tool ", toolCall.name);

    chatHistory.push({
      role: "model",
      parts: [
        {
          text: `calling tool ${toolCall.name}`,
          type: "text",
        },
      ],
    });

    let toolResult: ToolResult;

    try {
      // Try to call the tool through MCP server if we can
      let isMcpConnected = false;
      try {
        // Try to list tools as a way to check if connected
        await mcpClient.listTools();
        isMcpConnected = true;
      } catch (e) {
        isMcpConnected = false;
      }

      if (mcpClient && isMcpConnected) {
        console.log(`Calling MCP tool ${toolCall.name} with args:`, toolCall.args);
        toolResult = (await mcpClient.callTool({
          name: toolCall.name,
          arguments: toolCall.args,
        })) as ToolResult;
        console.log(`MCP tool result:`, toolResult);
      } else {
        // Fall back to mock implementation
        console.log(`Using mock implementation for tool ${toolCall.name}`);
        if (toolCall.name === "createPost") {
          const status = toolCall.args?.status || "No status provided";
          toolResult = {
            content: [
              {
                type: "text",
                text: `Would have posted to Twitter: ${status}`,
              },
            ],
          };
        } else {
          toolResult = {
            content: [
              {
                type: "text",
                text: `Unknown tool: ${toolCall.name}`,
              },
            ],
          };
        }
      }
    } catch (error: any) {
      console.error(`Error calling tool ${toolCall.name}:`, error);
      toolResult = {
        content: [
          {
            type: "text",
            text: `Error calling tool ${toolCall.name}: ${error?.message || 'Unknown error'}`,
          },
        ],
      };
    }

    if (toolResult.content[0]?.text) {
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: "Tool result : " + toolResult.content[0].text,
            type: "text",
          },
        ],
      });
    }
  } else {
    const question = await rl.question("You: ");
    chatHistory.push({
      role: "user",
      parts: [
        {
          text: question,
          type: "text",
        },
      ],
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: chatHistory,
    config: {
      tools: [
        {
          functionDeclarations: tools as FunctionDeclaration[],
        },
      ],
    },
  });

  if (!response.candidates?.length) {
    console.error("No candidates in response");
    return chatLoop();
  }

  const firstCandidate = response.candidates[0];
  if (!firstCandidate?.content?.parts?.length) {
    console.error("No content or parts in first candidate");
    return chatLoop();
  }

  const functionCall =
    firstCandidate?.content?.parts?.[0]?.functionCall ?? null;
  const responseText = firstCandidate!.content!.parts[0]?.text ?? "";

  if (functionCall) {
    return chatLoop(functionCall);
  }

  chatHistory.push({
    role: "model",
    parts: [
      {
        text: responseText,
        type: "text",
      },
    ],
  });

  console.log(`AI: ${responseText}`);

  chatLoop();
}