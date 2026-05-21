/**
 * Conversation-related type definitions
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result' | 'image';
  text?: string;
  name?: string;
  input?: any;
  content?: string;
  is_error?: boolean;
}

export interface ConversationSummary {
  taskId: string;
  timestamp: string;
  messageCount: number;
  toolUseCount: number;
  initialRequest: string;
  conversationText: string;
  problemScore: number;
  problemIndicators: ProblemIndicators;
}

export interface ProblemIndicators {
  hasErrors: boolean;
  errorCount: number;
  hasRetries: boolean;
  retryCount: number;
  hasNegativeFeedback: boolean;
  negativeFeedbackCount: number;
  hasConfusion: boolean;
  confusionCount: number;
  isLongConversation: boolean;
  hasHighToolUsage: boolean;
  hasToolFailures: boolean;
  toolFailureCount: number;
}

// Made with Bob
