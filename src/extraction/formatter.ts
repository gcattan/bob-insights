/**
 * Conversation formatting for display
 */

import type { Message } from '../types/index.js';
import { extractTextContent } from './content-extractor.js';

/**
 * Format a conversation for display with optional truncation
 */
export function formatConversation(conversation: Message[], maxLength: number = 2000): string {
  const lines: string[] = [];
  
  let messages = conversation;
  
  // If conversation is too long, show first and last messages with ellipsis
  if (messages.length > 15) {
    const half = 7;
    messages = [
      ...messages.slice(0, half),
      { role: 'system', content: `[... ${messages.length - 14} messages omitted ...]` },
      ...messages.slice(-half)
    ];
  }
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role.toUpperCase();
    const text = extractTextContent(msg);
    
    if (text) {
      lines.push(`[${i + 1}] ${role}: ${text.substring(0, 500)}`);
    }
  }
  
  let fullText = lines.join('\n\n');
  
  // Truncate if still too long
  if (fullText.length > maxLength) {
    fullText = fullText.substring(0, maxLength) + '\n\n[... truncated ...]';
  }
  
  return fullText;
}

/**
 * Format a single message for display
 */
export function formatMessage(message: Message, index?: number): string {
  const role = message.role.toUpperCase();
  const text = extractTextContent(message);
  const prefix = index !== undefined ? `[${index + 1}] ` : '';
  return `${prefix}${role}: ${text}`;
}

// Made with Bob
