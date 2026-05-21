/**
 * list_conversations tool handler
 */

import { z } from 'zod';
import type { ConversationSummary } from '../../types/index.js';
import { getAllTasks, readConversation } from '../../storage/index.js';
import { createConversationSummary } from '../../analysis/index.js';

export const listConversationsSchema = {
  limit: z.number().min(1).max(100).optional().describe("Number of recent conversations to list (default: 10)"),
  days: z.number().min(1).optional().describe("Only list conversations from last N days"),
  minScore: z.number().min(0).max(100).optional().describe("Minimum problem score to include (default: 0)")
};

export type ListConversationsParams = {
  limit?: number;
  days?: number;
  minScore?: number;
};

export async function listConversationsHandler(params: ListConversationsParams) {
  const { limit = 10, days, minScore = 0 } = params;
  
  try {
    let tasks = getAllTasks();
    
    if (tasks.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No conversations found in local storage"
        }]
      };
    }
    
    // Filter by date if specified
    if (days) {
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      tasks = tasks.filter(t => t.mtime >= cutoff);
    }
    
    // Sort by recency and limit
    tasks.sort((a, b) => b.mtime - a.mtime);
    tasks = tasks.slice(0, limit);
    
    // Process each task
    const summaries: ConversationSummary[] = [];
    for (const task of tasks) {
      try {
        const conversation = readConversation(task.path);
        const summary = createConversationSummary(task, conversation);
        
        if (summary.problemScore >= minScore) {
          summaries.push(summary);
        }
      } catch (error) {
        console.error(`Error processing task ${task.taskId}:`, error);
      }
    }
    
    // Sort by problem score
    summaries.sort((a, b) => b.problemScore - a.problemScore);
    
    // Format response
    const result = summaries.map(s => ({
      task_id: s.taskId,
      timestamp: s.timestamp,
      problem_score: s.problemScore,
      messages: s.messageCount,
      tools: s.toolUseCount,
      initial_request: s.initialRequest,
      indicators: {
        errors: s.problemIndicators.errorCount,
        retries: s.problemIndicators.retryCount,
        tool_failures: s.problemIndicators.toolFailureCount,
        negative_feedback: s.problemIndicators.negativeFeedbackCount
      }
    }));
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          total_found: tasks.length,
          filtered_count: summaries.length,
          conversations: result
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `Error listing conversations: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}

// Made with Bob
