/**
 * analyze_problems tool handler
 */

import { z } from 'zod';
import type { ConversationSummary } from '../../types/index.js';
import { getAllTasks, readConversation } from '../../storage/index.js';
import { createConversationSummary } from '../../analysis/index.js';
import { buildAnalysisPrompt } from '../../llm/index.js';

export const analyzeProblemsSchema = {
  limit: z.number().min(1).max(100).optional().describe("Number of recent conversations to check (default: 20)"),
  days: z.number().min(1).optional().describe("Only analyze conversations from last N days"),
  minScore: z.number().min(0).max(100).optional().describe("Minimum problem score to analyze (default: 30)"),
  question: z.string().optional().describe("Custom question for analysis")
};

export type AnalyzeProblemsParams = {
  limit?: number;
  days?: number;
  minScore?: number;
  question?: string;
};

export async function analyzeProblemsHandler(params: AnalyzeProblemsParams) {
  const { limit = 20, days, minScore = 30, question } = params;
  
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
    
    // Process all tasks
    const allSummaries: ConversationSummary[] = [];
    for (const task of tasks) {
      try {
        const conversation = readConversation(task.path);
        const summary = createConversationSummary(task, conversation);
        allSummaries.push(summary);
      } catch (error) {
        console.error(`Error processing task ${task.taskId}:`, error);
      }
    }
    
    // Filter problematic conversations
    const problematicSummaries = allSummaries.filter(s => s.problemScore >= minScore);
    problematicSummaries.sort((a, b) => b.problemScore - a.problemScore);
    
    if (problematicSummaries.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            message: "No problematic conversations found",
            total_checked: allSummaries.length,
            threshold: minScore,
            suggestion: "Lower the minScore threshold or use --all flag"
          }, null, 2)
        }]
      };
    }
    
    // Build analysis prompt
    const prompt = buildAnalysisPrompt(problematicSummaries, { question });
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          summary: {
            total_checked: allSummaries.length,
            problematic_count: problematicSummaries.length,
            threshold: minScore
          },
          analysis_prompt: prompt
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `Error analyzing conversations: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}

// Made with Bob
