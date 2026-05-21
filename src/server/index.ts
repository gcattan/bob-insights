/**
 * MCP Server setup and tool registration
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  listConversationsSchema,
  listConversationsHandler
} from './tools/list-conversations.js';
import {
  getConversationSchema,
  getConversationHandler
} from './tools/get-conversation.js';
import {
  analyzeProblemsSchema,
  analyzeProblemsHandler
} from './tools/analyze-problems.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "bob-insights",
    version: "1.0.0"
  });

  // Register list_conversations tool
  server.tool(
    "list_conversations",
    listConversationsSchema,
    listConversationsHandler
  );

  // Register get_conversation tool
  server.tool(
    "get_conversation",
    getConversationSchema,
    getConversationHandler
  );

  // Register analyze_problems tool
  server.tool(
    "analyze_problems",
    analyzeProblemsSchema,
    analyzeProblemsHandler
  );

  return server;
}

/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bob Insights MCP server running on stdio');
}

// Made with Bob
