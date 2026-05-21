/**
 * Analysis-related type definitions
 */

import type { ProblemIndicators } from './conversation.js';

export interface ProblemPatterns {
  errors: RegExp;
  retries: RegExp;
  negativeFeedback: RegExp;
  confusion: RegExp;
}

export interface DetectionResult {
  pattern: keyof ProblemPatterns;
  matches: string[];
  count: number;
}

export interface AnalysisResult {
  indicators: ProblemIndicators;
  score: number;
}

// Made with Bob
