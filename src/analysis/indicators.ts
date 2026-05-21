/**
 * Problem indicator calculation and scoring
 */

import type { ProblemIndicators } from '../types/index.js';

/**
 * Calculate a problem score from indicators (0-100)
 */
export function calculateProblemScore(indicators: ProblemIndicators): number {
  let score = 0;
  
  // Tool failures are the most serious (up to 30 points)
  score += Math.min(indicators.toolFailureCount * 10, 30);
  
  // Error mentions (up to 20 points)
  score += Math.min(indicators.errorCount * 2, 20);
  
  // Retry attempts (up to 15 points)
  score += Math.min(indicators.retryCount * 3, 15);
  
  // Negative feedback (up to 15 points)
  score += Math.min(indicators.negativeFeedbackCount * 2, 15);
  
  // Confusion signals (up to 10 points)
  score += Math.min(indicators.confusionCount * 2, 10);
  
  // Long conversation (5 points)
  if (indicators.isLongConversation) {
    score += 5;
  }
  
  // High tool usage (5 points)
  if (indicators.hasHighToolUsage) {
    score += 5;
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get severity level based on problem score
 */
export function getSeverityLevel(score: number): 'smooth' | 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 30) return 'low';
  return 'smooth';
}

/**
 * Check if a conversation is problematic based on score threshold
 */
export function isProblematic(score: number, threshold: number = 30): boolean {
  return score >= threshold;
}

// Made with Bob
