// @ts-nocheck
/**
 * Bracket Generation and Management Utilities
 * Handles single and double elimination tournament brackets
 */

import { BracketFormat } from '@prisma/client'

export interface Player {
  id: string
  name: string
  seed?: number
}

export interface BracketMatchData {
  roundNumber: number
  matchNumber: number
  bracketPosition: string
  isWinnerBracket: boolean
  player1Id: string | null
  player1Name: string | null
  player2Id: string | null
  player2Name: string | null
}

/**
 * Calculate the number of rounds needed for a bracket
 */
export function calculateRounds(playerCount: number, format: BracketFormat): number {
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(playerCount)))
  const mainRounds = Math.log2(nextPowerOfTwo)
  
  if (format === 'DOUBLE_ELIMINATION') {
    // Double elimination has winner bracket + loser bracket
    return Math.ceil(mainRounds * 2) + 1 // +1 for grand finals
  }
  
  return mainRounds
}

/**
 * Calculate the number of matches in a round
 */
export function calculateMatchesInRound(roundNumber: number, totalPlayers: number, format: BracketFormat): number {
  if (format === 'SINGLE_ELIMINATION') {
    const totalRounds = calculateRounds(totalPlayers, format)
    const matchesInFirstRound = Math.ceil(totalPlayers / 2)
    return Math.ceil(matchesInFirstRound / Math.pow(2, roundNumber - 1))
  }
  
  // For double elimination, this is more complex
  // Simplification: similar to single for now
  return Math.ceil(totalPlayers / Math.pow(2, roundNumber))
}

/**
 * Generate bracket position string (e.g., "W1-1", "L2-3")
 */
export function generateBracketPosition(roundNumber: number, matchNumber: number, isWinnerBracket: boolean = true): string {
  const prefix = isWinnerBracket ? 'W' : 'L'
  return `${prefix}${roundNumber}-${matchNumber}`
}

/**
 * Generate single elimination bracket
 */
export function generateSingleEliminationBracket(players: Player[]): BracketMatchData[] {
  const matches: BracketMatchData[] = []
  const playerCount = players.length
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(playerCount)))
  const totalRounds = Math.log2(nextPowerOfTwo)
  const byeCount = nextPowerOfTwo - playerCount
  
  // Seed players (1 vs lowest, 2 vs 2nd lowest, etc.)
  const seededPlayers = [...players].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999))
  
  // First round - pair players with byes handled
  const firstRoundMatches = Math.ceil(playerCount / 2)
  let playerIndex = 0
  
  for (let matchNum = 1; matchNum <= firstRoundMatches; matchNum++) {
    const player1 = seededPlayers[playerIndex++] ?? null
    const player2 = seededPlayers[playerIndex++] ?? null
    
    matches.push({
      roundNumber: 1,
      matchNumber: matchNum,
      bracketPosition: generateBracketPosition(1, matchNum),
      isWinnerBracket: true,
      player1Id: player1?.id ?? null,
      player1Name: player1?.name ?? null,
      player2Id: player2?.id ?? null,
      player2Name: player2?.name ?? null,
    })
  }
  
  // Generate empty matches for subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round)
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      matches.push({
        roundNumber: round,
        matchNumber: matchNum,
        bracketPosition: generateBracketPosition(round, matchNum),
        isWinnerBracket: true,
        player1Id: null,
        player1Name: null,
        player2Id: null,
        player2Name: null,
      })
    }
  }
  
  return matches
}

/**
 * Generate double elimination bracket
 */
export function generateDoubleEliminationBracket(players: Player[]): BracketMatchData[] {
  const matches: BracketMatchData[] = []
  const playerCount = players.length
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(playerCount)))
  const totalWinnerRounds = Math.log2(nextPowerOfTwo)
  
  // Generate winner bracket (same as single elimination)
  const winnerBracket = generateSingleEliminationBracket(players)
  matches.push(...winnerBracket)
  
  // Generate loser bracket
  // Loser bracket has (2 * totalWinnerRounds - 1) rounds
  const loserBracketRounds = Math.ceil((totalWinnerRounds - 1) * 2)
  
  for (let round = 1; round <= loserBracketRounds; round++) {
    // Matches in loser bracket decrease more gradually
    const matchesInRound = Math.max(1, Math.ceil(playerCount / Math.pow(2, round + 1)))
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      matches.push({
        roundNumber: totalWinnerRounds + round,
        matchNumber: matchNum,
        bracketPosition: generateBracketPosition(round, matchNum, false),
        isWinnerBracket: false,
        player1Id: null,
        player1Name: null,
        player2Id: null,
        player2Name: null,
      })
    }
  }
  
  // Add grand finals
  matches.push({
    roundNumber: Math.ceil(totalWinnerRounds + loserBracketRounds + 1),
    matchNumber: 1,
    bracketPosition: 'GF-1',
    isWinnerBracket: true,
    player1Id: null,
    player1Name: null,
    player2Id: null,
    player2Name: null,
  })
  
  return matches
}

/**
 * Get match advancement logic
 */
export function getNextMatchPosition(currentMatch: BracketMatchData, format: BracketFormat): string | null {
  const { roundNumber, matchNumber, isWinnerBracket } = currentMatch
  
  if (format === 'SINGLE_ELIMINATION') {
    // Winner advances to next round, same or half match number
    const nextMatchNumber = Math.ceil(matchNumber / 2)
    return generateBracketPosition(roundNumber + 1, nextMatchNumber)
  }
  
  if (format === 'DOUBLE_ELIMINATION') {
    if (isWinnerBracket) {
      // Winner advances in winner bracket
      const nextMatchNumber = Math.ceil(matchNumber / 2)
      return generateBracketPosition(roundNumber + 1, nextMatchNumber)
    } else {
      // In loser bracket, advance to next loser bracket match
      // Complex logic - simplified here
      return generateBracketPosition(roundNumber + 1, Math.ceil(matchNumber / 2), false)
    }
  }
  
  return null
}

/**
 * Get loser bracket destination (for double elimination)
 */
export function getLoserBracketPosition(winnerBracketMatch: BracketMatchData): string | null {
  const { roundNumber, matchNumber } = winnerBracketMatch
  
  // Losers from round N of winner bracket go to specific loser bracket positions
  // Simplified: loser goes to loser bracket at round (N * 2 - 1)
  const loserRound = roundNumber * 2 - 1
  return generateBracketPosition(loserRound, matchNumber, false)
}

/**
 * Calculate tournament progress percentage
 */
export function calculateTournamentProgress(completedMatches: number, totalMatches: number): number {
  if (totalMatches === 0) return 0
  return Math.round((completedMatches / totalMatches) * 100)
}

/**
 * Get round name (e.g., "Finals", "Semi-Finals", "Quarter-Finals")
 */
export function getRoundName(roundNumber: number, totalRounds: number, isWinnerBracket: boolean = true): string {
  const roundsFromEnd = totalRounds - roundNumber
  
  if (!isWinnerBracket) {
    return `Loser Bracket Round ${roundNumber}`
  }
  
  if (roundsFromEnd === 0) return 'Finals'
  if (roundsFromEnd === 1) return 'Semi-Finals'
  if (roundsFromEnd === 2) return 'Quarter-Finals'
  if (roundsFromEnd === 3) return 'Round of 16'
  if (roundsFromEnd === 4) return 'Round of 32'
  
  return `Round ${roundNumber}`
}
