/**
 * Commission Calculations
 *
 * All commission-related pure functions
 */

import type { Chit } from "@/types/chit.types";

/**
 * Calculate commission amount for a chit
 *
 * Formula: commissionAmount = schemeValue × commissionPercent
 *
 * @param chit - The chit to calculate commission for
 * @returns Commission amount
 *
 * @example
 * getCommissionAmount({ schemeValue: 500000, commissionPercent: 0.03 })
 * // Returns: 15000
 */
export function getCommissionAmount(chit: Chit): number {
  return chit.schemeValue * chit.commissionPercent;
}
