/**
 * Content extraction from messages
 */

import type { Message, ContentBlock } from '../types/index.js';
import { isMcpTool } from './tool-detector.js';

/**
 * Extract text content from a message
 */
export function extractTextContent(message: Message): string {
  const content = message.content;
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const block of content) {
      if (block.type === 'text' && block.text) {
        texts.push(block.text);
      } else if (block.type === 'tool_use' && block.name && isMcpTool(block.name)) {
        texts.push(`[MCP Tool: ${block.name}]`);
      } else if (block.type === 'tool_result') {
        const status = block.is_error ? 'Error' : 'Success';
        texts.push(`[Tool Result: ${status}]`);
      }
    }
    return texts.join(' ');
  }
  
  return '';
}

/**
 * Extract the initial user request from a conversation
 */
export function extractInitialRequest(conversation: Message[]): string {
  const userMessages = conversation.filter(m => m.role === 'user');
  if (userMessages.length === 0) {
    return '';
  }
  
  const firstMessage = userMessages[0];
  const text = extractTextContent(firstMessage);
  return text.substring(0, 200);
}

/**
 * Extract all text from a conversation
 */
export function extractAllText(conversation: Message[]): string {
  return conversation
    .map(msg => extractTextContent(msg))
    .join(' ');
}

// Made with Bob
