# 🐦 X-Post MCP 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-v1.2.5-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue)](https://www.typescriptlang.org/)

A powerful integration that allows AI models to post directly to X (formerly Twitter) using the Model Context Protocol (MCP) 🤖✨

## 📋 Overview

X-Post MCP is a client-server application that enables AI models to create and publish posts on X (formerly Twitter) through a standardized interface. It leverages the Model Context Protocol to provide a seamless integration between AI models and the X platform.

## ✨ Features

- 🔄 Seamless integration with X (Twitter) API
- 🧠 AI-powered post creation using Google's Gemini models
- 🛠️ MCP server exposing X posting functionality as a tool
- 💬 Interactive chat interface for testing and demonstration
- 🔒 Secure handling of API credentials
- ✂️ Automatic truncation of posts exceeding X's character limit

## 🛠️ Technologies

- **[Bun](https://bun.sh)**: Fast all-in-one JavaScript runtime
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Express](https://expressjs.com/)**: Web framework for Node.js
- **[Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp)**: Standardized protocol for AI context
- **[Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)**: X platform API
- **[Google Gemini](https://ai.google.dev/)**: Google's generative AI models

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh) v1.2.5 or later
- X (Twitter) API credentials
- Google Gemini API key

### Server Setup

```bash
# Clone the repository
git clone https://github.com/subhadeeproy3902/x-post-mcp.git
cd x-post-mcp

# Install server dependencies
cd server
bun install
```

### Client Setup

```bash
# From the project root
cd client
bun install
```

## ⚙️ Configuration

### Obtaining X (Twitter) API Credentials

1. **Create a Developer Account**:
   - Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Sign in with your X account or create a new one
   - Apply for a developer account if you don't have one already

2. **Create a Project & App**:
   - Once approved, create a new Project in the Developer Portal
   - Within the project, create a new App
   - Give your app a name and description

3. **Set App Permissions**:
   - In your App settings, navigate to the "User authentication settings" section
   - Edit the settings and enable OAuth 1.0a
   - Set App permissions to **Read and Write and Direct Messages**
   - Save your changes

4. **Generate Access Tokens**:
   - Navigate to the "Keys and Tokens" tab
   - Generate "Consumer Keys" (API Key and Secret)
   - Generate "Access Token and Secret" for your account
   - Make sure to save all four values as they will be needed for configuration

> ⚠️ **Important**: Keep your API keys and tokens secure and never commit them to public repositories.

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# X (Twitter) API Credentials
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

### Obtaining Google Gemini API Key

1. **Create a Google AI Studio Account**:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Get API Key**:
   - Navigate to the [API Keys section](https://aistudio.google.com/apikey)
   - Click "Create API Key"
   - Copy your new API key

> ⚠️ **Important**: Keep your API key secure and never commit it to public repositories.

### Client Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Usage

### Starting the Server

```bash
cd server
bun run dev
```

The server will start on [http://localhost:3001](http://localhost:3001).

### Starting the Client

```bash
cd client
bun run index.ts
```

The client will connect to the server and provide an interactive chat interface where you can interact with the AI model and instruct it to post to X.

### Example Commands

Once the client is running, you can interact with the AI model:

```text
You: Post a tweet about the beautiful weather today
```

The AI will use the Gemini model to generate a post and then use the MCP tool to publish it to X.

## 🏗️ Architecture

### Server

The server component is built with Express and implements the Model Context Protocol. It exposes a tool called `createPost` that can be used to post to X. The server uses Server-Sent Events (SSE) for communication with clients.

### Client

The client component connects to the MCP server and provides an interface for interacting with Google's Gemini AI models. It translates user requests into AI-generated content and can call the server's tools to post to X.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) for providing the standardized AI context protocol
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api) for X platform integration
- [Google Gemini](https://ai.google.dev/) for AI capabilities
