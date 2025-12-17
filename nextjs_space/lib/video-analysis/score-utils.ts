/**
 * Video Analysis Score Utilities
 * Prevents NaN and ensures valid score display
 */

/**
 * Safely parse and validate a score value
 * @param score - The score value (can be number, string, null, undefined)
 * @param defaultScore - Default score if invalid (default: 0)
 * @returns A valid number between 0 and 100
 */
export function parseScore(score: any, defaultScore: number = 0): number {
  // Handle null/undefined
  if (score === null || score === undefined) {
    return defaultScore
  }

  // Parse if string
  const parsed = typeof score === 'string' ? parseFloat(score) : Number(score)

  // Validate it's a valid number
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultScore
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(parsed)))
}

/**
 * Format a score for display
 * @param score - The score value
 * @param defaultText - Text to show if score is invalid (default: "Pending")
 * @returns Formatted score string (e.g., "85/100" or "Pending")
 */
export function formatScore(score: any, defaultText: string = 'Pending'): string {
  const parsed = parseScore(score, -1)
  
  if (parsed < 0) {
    return defaultText
  }

  return `${parsed}/100`
}

/**
 * Get a safe numeric score value (never null, never NaN)
 * @param score - The score value
 * @param fallback - Fallback value if invalid (default: 0)
 * @returns Valid number
 */
export function getSafeScore(score: any, fallback: number = 0): number {
  return parseScore(score, fallback)
}

/**
 * Check if a score is valid (not null, not NaN)
 * @param score - The score to check
 * @returns true if score is a valid number
 */
export function isValidScore(score: any): boolean {
  if (score === null || score === undefined) return false
  const num = Number(score)
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 100
}

/**
 * Calculate average score from an array of scores
 * @param scores - Array of score values
 * @returns Average score (0 if no valid scores)
 */
export function calculateAverageScore(scores: any[]): number {
  const validScores = scores
    .map(s => parseScore(s, -1))
    .filter(s => s >= 0)

  if (validScores.length === 0) return 0

  const sum = validScores.reduce((acc, score) => acc + score, 0)
  return Math.round(sum / validScores.length)
}
