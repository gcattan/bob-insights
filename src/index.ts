#!/usr/bin/env node
/**
 * Bob Insights MCP Server
 * Provides conversation analysis tools for Bob AI assistant history
 * 
 * Refactored modular architecture with separated concerns:
 * - types: Type definitions
 * - storage: File system operations
 * - extraction: Content extraction and formatting
 * - analysis: Problem detection and scoring
 * - llm: Prompt building
 * - server: MCP server and tool handlers
 */

import { startServer } from './server/index.js';

// Start the MCP server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Made with Bob
