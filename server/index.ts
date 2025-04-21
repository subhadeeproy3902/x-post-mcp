import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { createPost } from "./mcp.tool";
import cors from "cors";

const server = new McpServer({
  name: "x-post",
  version: "1.0.0",
});

// ... set up server resources, tools, and prompts ...

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

server.tool(
  "createPost",
  "Create a post on X formally known as Twitter ",
  {
    status: z.string(),
  },
  async (arg) => {
    const { status } = arg;
    const post = await createPost(status);
    return {
      content: [
        {
          type: "text",
          text: post.content?.[0]?.text || "Post created",
        },
      ],
    };
  }
);

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (_: Request, res: Response) => {
  console.log("Received SSE connection request");
  try {
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    console.log(`Created transport with sessionId: ${transport.sessionId}`);
    res.on("close", () => {
      console.log(`Closing transport with sessionId: ${transport.sessionId}`);
      delete transports[transport.sessionId];
    });
    await server.connect(transport);
    console.log(`Connected transport with sessionId: ${transport.sessionId}`);
  } catch (error) {
    console.error("Error handling SSE connection:", error);
    res.status(500).end();
  }
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  console.log(`Received message for sessionId: ${sessionId}`);
  const transport = transports[sessionId];
  if (transport) {
    try {
      await transport.handlePostMessage(req, res);
      console.log(`Handled message for sessionId: ${sessionId}`);
    } catch (error) {
      console.error(`Error handling message for sessionId: ${sessionId}:`, error);
      res.status(500).send("Error handling message");
    }
  } else {
    console.warn(`No transport found for sessionId: ${sessionId}`);
    res.status(400).send("No transport found for sessionId");
  }
});

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
