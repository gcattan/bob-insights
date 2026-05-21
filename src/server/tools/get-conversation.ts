/**
 * get_conversation tool handler
 */

import { z } from 'zod';
import { findTaskById, readConversation } from '../../storage/index.js';
import { createConversationSummary } from '../../analysis/index.js';

export const getConversationSchema = {
  taskId: z.string().describe("Task ID of the conversation to retrieve")
};

export type GetConversationParams = {
  taskId: string;
};

export async function getConversationHandler(params: GetConversationParams) {
  const { taskId } = params;
  
  try {
    const task = findTaskById(taskId);
    
    if (!task) {
      return {
        content: [{
          type: "text" as const,
          text: `Conversation with task ID '${taskId}' not found`
        }],
        isError: true
      };
    }
    
    const conversation = readConversation(task.path);
    const summary = createConversationSummary(task, conversation);
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          task_id: summary.taskId,
          timestamp: summary.timestamp,
          problem_score: summary.problemScore,
          message_count: summary.messageCount,
          tool_use_count: summary.toolUseCount,
          initial_request: summary.initialRequest,
          problem_indicators: summary.problemIndicators,
          conversation: summary.conversationText
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `Error retrieving conversation: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}

// Made with Bob
