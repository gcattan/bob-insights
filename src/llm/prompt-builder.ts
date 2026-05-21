/**
 * LLM prompt building for conversation analysis
 */

import type { ConversationSummary } from '../types/index.js';

export interface PromptOptions {
  question?: string;
  includeContext?: boolean;
  maxConversations?: number;
}

/**
 * Build an analysis prompt for problematic conversations
 */
export function buildAnalysisPrompt(
  summaries: ConversationSummary[],
  options: PromptOptions = {}
): string {
  const {
    question = 'What are the root causes and learning opportunities from these problematic conversations?',
    includeContext = true,
    maxConversations
  } = options;
  
  const conversationsToAnalyze = maxConversations
    ? summaries.slice(0, maxConversations)
    : summaries;
  
  let prompt = `# Bob Conversation Analysis - Problematic Conversations

## Question
${question}
`;

  if (includeContext) {
    prompt += `
## Context
These ${conversationsToAnalyze.length} conversations were pre-filtered as having issues (errors, retries, negative feedback).
Focus on understanding WHY problems occurred and HOW to prevent them.
`;
  }

  prompt += `
## Conversations to Analyze
`;

  for (let i = 0; i < conversationsToAnalyze.length; i++) {
    const conv = conversationsToAnalyze[i];
    const indicators = conv.problemIndicators;
    
    prompt += `
### Conversation ${i + 1} (Problem Score: ${conv.problemScore}/100)
- **Task ID**: ${conv.taskId}
- **Date**: ${conv.timestamp}
- **Messages**: ${conv.messageCount} | **Tool Uses**: ${conv.toolUseCount}
- **Initial Request**: ${conv.initialRequest}

**Problem Indicators**:
- Errors: ${indicators.errorCount} | Tool Failures: ${indicators.toolFailureCount}
- Retries: ${indicators.retryCount} | Negative Feedback: ${indicators.negativeFeedbackCount}
- Confusion: ${indicators.confusionCount}

**Conversation**:
\`\`\`
${conv.conversationText}
\`\`\`

---
`;
  }

  prompt += `

## Analysis Instructions

Focus ONLY on insights that regex cannot provide. Analyze these conversations for:

### 1. Root Cause Analysis
- **Why** did the problems occur?
- What was the underlying cause of errors/retries?
- Was it unclear requirements, technical issues, or workflow problems?

### 2. Context & Intent Understanding
- What was the user really trying to achieve?
- Was the initial request clear or ambiguous?
- Did the conversation drift from the original goal?

### 3. Solution Quality Assessment
- Was the final solution appropriate and complete?
- Were there better approaches that weren't explored?
- What was missed or could be improved?

### 4. Learning Opportunities
- What specific lessons can be learned from each conversation?
- What patterns indicate areas for improvement?
- What should be done differently next time?

## Output Format

Provide concise, actionable insights in JSON:

\`\`\`json
{
  "conversations": [
    {
      "task_id": "...",
      "root_cause": "Brief explanation of why problems occurred",
      "user_intent": "What user was trying to achieve",
      "solution_quality": "good|adequate|poor",
      "key_lesson": "Main takeaway from this conversation"
    }
  ],
  "aggregate_insights": {
    "common_root_causes": ["cause1", "cause2"],
    "recurring_patterns": ["pattern1", "pattern2"],
    "improvement_areas": ["area1", "area2"]
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "recommendation": "Specific actionable advice",
      "rationale": "Why this will help"
    }
  ]
}
\`\`\`
`;

  return prompt;
}

/**
 * Build a simple summary prompt
 */
export function buildSummaryPrompt(summary: ConversationSummary): string {
  return `Analyze this conversation and provide insights:

Task ID: ${summary.taskId}
Date: ${summary.timestamp}
Problem Score: ${summary.problemScore}/100
Messages: ${summary.messageCount}
Tool Uses: ${summary.toolUseCount}

Initial Request: ${summary.initialRequest}

Conversation:
${summary.conversationText}

What went well and what could be improved?`;
}

// Made with Bob
