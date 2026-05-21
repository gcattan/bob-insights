/**
 * Problem detection using pattern matching
 */

import type { Message, ProblemIndicators, ProblemPatterns } from '../types/index.js';
import { extractAllText } from '../extraction/index.js';

/**
 * Default problem detection patterns
 */
export const PROBLEM_PATTERNS: ProblemPatterns = {
  errors: /\b(error|failed|exception|cannot|unable to|could not|failure|fail|crash|broke|broken)\b/gi,
  retries: /\b(try again|retry|attempt|let me try|one more time|re-run|rerun|redo)\b/gi,
  negativeFeedback: /\b(doesn't work|not working|still not|issue|problem|bug|wrong|incorrect|bad|worse)\b/gi,
  confusion: /\b(confused|unclear|don't understand|what do you mean|not sure|uncertain|ambiguous)\b/gi,
};

/**
 * Count tool failures in a conversation
 */
function countToolFailures(conversation: Message[]): number {
  let count = 0;
  
  for (const message of conversation) {
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_result' && block.is_error) {
          count++;
        }
      }
    }
  }
  
  return count;
}

/**
 * Analyze a conversation for problem indicators
 */
export function analyzeConversationProblems(
  conversation: Message[],
  patterns: ProblemPatterns = PROBLEM_PATTERNS
): ProblemIndicators {
  const fullText = extractAllText(conversation).toLowerCase();
  
  const toolFailureCount = countToolFailures(conversation);
  
  const errorMatches = fullText.match(patterns.errors) || [];
  const retryMatches = fullText.match(patterns.retries) || [];
  const negativeFeedbackMatches = fullText.match(patterns.negativeFeedback) || [];
  const confusionMatches = fullText.match(patterns.confusion) || [];
  
  const messageCount = conversation.length;
  
  // Count tool uses - we'll import this from extraction
  let toolUseCount = 0;
  for (const message of conversation) {
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_use') {
          toolUseCount++;
        }
      }
    }
  }
  
  return {
    hasErrors: errorMatches.length > 0,
    errorCount: errorMatches.length,
    hasRetries: retryMatches.length > 0,
    retryCount: retryMatches.length,
    hasNegativeFeedback: negativeFeedbackMatches.length > 0,
    negativeFeedbackCount: negativeFeedbackMatches.length,
    hasConfusion: confusionMatches.length > 0,
    confusionCount: confusionMatches.length,
    isLongConversation: messageCount > 20,
    hasHighToolUsage: toolUseCount > 15,
    hasToolFailures: toolFailureCount > 0,
    toolFailureCount: toolFailureCount,
  };
}

// Made with Bob
