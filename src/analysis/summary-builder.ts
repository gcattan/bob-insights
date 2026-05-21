/**
 * Conversation summary building
 */

import type { TaskInfo, Message, ConversationSummary } from '../types/index.js';
import { extractInitialRequest, formatConversation, countToolUses } from '../extraction/index.js';
import { analyzeConversationProblems } from './problem-detector.js';
import { calculateProblemScore } from './indicators.js';

/**
 * Create a conversation summary from task info and messages
 */
export function createConversationSummary(
  taskInfo: TaskInfo,
  conversation: Message[]
): ConversationSummary {
  const initialRequest = extractInitialRequest(conversation);
  const conversationText = formatConversation(conversation);
  const toolUseCount = countToolUses(conversation);
  const problemIndicators = analyzeConversationProblems(conversation);
  const problemScore = calculateProblemScore(problemIndicators);
  
  return {
    taskId: taskInfo.taskId,
    timestamp: new Date(taskInfo.mtime).toISOString(),
    messageCount: conversation.length,
    toolUseCount,
    initialRequest,
    conversationText,
    problemScore,
    problemIndicators
  };
}

/**
 * Build summaries for multiple tasks
 */
export function buildSummaries(
  tasks: TaskInfo[],
  conversations: Map<string, Message[]>
): ConversationSummary[] {
  const summaries: ConversationSummary[] = [];
  
  for (const task of tasks) {
    const conversation = conversations.get(task.taskId);
    if (conversation) {
      summaries.push(createConversationSummary(task, conversation));
    }
  }
  
  return summaries;
}

// Made with Bob
