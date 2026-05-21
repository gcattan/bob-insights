/**
 * Tool detection - distinguishes between MCP and internal Bob tools
 */

import type { Message, ContentBlock } from '../types/index.js';

/**
 * Set of internal Bob tools (not MCP tools)
 */
const INTERNAL_BOB_TOOLS = new Set([
  'read_file', 'write_to_file', 'apply_diff', 'insert_content',
  'execute_command', 'browser_action', 'list_files', 'list_code_definition_names',
  'search_files', 'ask_followup_question', 'attempt_completion', 'use_skill',
  'switch_mode', 'new_task', 'update_todo_list', 'create_temporary_file',
  'fetch_instructions', 'generate_description_from_diff', 'create_pull_request',
  'obtain_git_diff', 'submit_review_findings', 'fetch_github_issue'
]);

/**
 * Check if a tool is an MCP tool (not an internal Bob tool)
 */
export function isMcpTool(toolName: string): boolean {
  return !INTERNAL_BOB_TOOLS.has(toolName);
}

/**
 * Count MCP tool uses in a conversation
 */
export function countToolUses(conversation: Message[]): number {
  let count = 0;
  
  for (const message of conversation) {
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_use' && block.name && isMcpTool(block.name)) {
          count++;
        }
      }
    }
  }
  
  return count;
}

/**
 * Get all MCP tool names used in a conversation
 */
export function getMcpToolNames(conversation: Message[]): string[] {
  const toolNames = new Set<string>();
  
  for (const message of conversation) {
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_use' && block.name && isMcpTool(block.name)) {
          toolNames.add(block.name);
        }
      }
    }
  }
  
  return Array.from(toolNames);
}

// Made with Bob
