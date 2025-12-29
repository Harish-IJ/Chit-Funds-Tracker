/**
 * Dues and Monthly Calculations
 *
 * All functions related to monthly dues and collections
 */

import type { Chit, ChitMonth, ChitFundData } from "@/types/chit.types";
import { getCommissionAmount } from "./commission";

/**
 * Calculate monthly due per participant for a specific month
 *
 * AUCTION MONTH:
 *   collectionBase = schemeValue + commissionAmount - auctionAmount
 *   monthlyDue = collectionBase / participantsCount
 *
 * COMPANY MONTH:
 *   monthlyDue = schemeValue / durationMonths
 *
 * @param chit - The chit
 * @param chitMonth - The specific month
 * @returns Monthly due per participant
 *
 * @example Auction month
 * getMonthlyDue(
 *   { schemeValue: 500000, participantsCount: 20, commissionPercent: 0.03 },
 *   { type: 'auction', auctionAmount: 150000 }
 * )
 * // Returns: 18250
 * // Calculation: (500000 + 15000 - 150000) / 20 = 365000 / 20 = 18250
 *
 * @example Company month
 * getMonthlyDue(
 *   { schemeValue: 500000, durationMonths: 20 },
 *   { type: 'company' }
 * )
 * // Returns: 25000
 * // Calculation: 500000 / 20 = 25000
 */
export function getMonthlyDue(chit: Chit, chitMonth: ChitMonth): number {
  if (chitMonth.type === "auction") {
    if (!chitMonth.auctionAmount) {
      throw new Error("Auction month must have auctionAmount");
    }

    const commissionAmount = getCommissionAmount(chit);
    const collectionBase =
      chit.schemeValue + commissionAmount - chitMonth.auctionAmount;
    return collectionBase / chit.participantsCount;
  } else {
    // Company month
    return chit.schemeValue / chit.durationMonths;
  }
}

/**
 * Calculate the winner payout for an auction month
 *
 * Formula: schemeValue - auctionAmount
 *
 * @param chit - The chit
 * @param chitMonth - The auction month
 * @returns Payout amount to winner
 *
 * @example
 * getWinnerPayout(
 *   { schemeValue: 500000 },
 *   { type: 'auction', auctionAmount: 150000 }
 * )
 * // Returns: 350000
 */
export function getWinnerPayout(chit: Chit, chitMonth: ChitMonth): number {
  if (chitMonth.type !== "auction" || !chitMonth.auctionAmount) {
    return 0;
  }

  return chit.schemeValue - chitMonth.auctionAmount;
}

/**
 * Calculate total expected contribution per participant over entire chit lifecycle
 *
 * This is complex because each month has different dues depending on:
 * - Whether it's auction or company month
 * - The auction amount (if auction month)
 *
 * @param chitId - The chit ID
 * @param data - All data
 * @returns Total expected contribution per participant
 */
export function getTotalExpectedContribution(
  chitId: string,
  data: ChitFundData
): number {
  const chit = data.chits.find((c) => c.id === chitId);
  if (!chit) {
    throw new Error(`Chit not found: ${chitId}`);
  }

  const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chitId);

  let total = 0;
  for (const month of chitMonths) {
    total += getMonthlyDue(chit, month);
  }

  return total;
}

/**
 * Calculate shortfall for a specific month
 *
 * Shortfall = (expected collection) - (actual payments received)
 *
 * @param chitId - The chit ID
 * @param monthNumber - The month number
 * @param data - All data
 * @returns Shortfall amount (positive means shortfall, negative means excess)
 */
export function getMonthShortfall(
  chitId: string,
  monthNumber: number,
  data: ChitFundData
): number {
  const chit = data.chits.find((c) => c.id === chitId);
  if (!chit) {
    throw new Error(`Chit not found: ${chitId}`);
  }

  const chitMonth = data.chitMonths.find(
    (cm) => cm.chitId === chitId && cm.monthNumber === monthNumber
  );
  if (!chitMonth) {
    throw new Error(`ChitMonth not found: ${chitId}, month ${monthNumber}`);
  }

  // Expected collection = monthly due × number of participants
  const monthlyDue = getMonthlyDue(chit, chitMonth);
  const expectedCollection = monthlyDue * chit.participantsCount;

  // Actual collection = sum of all payments for this month
  const actualCollection = data.payments
    .filter((p) => p.chitId === chitId && p.monthNumber === monthNumber)
    .reduce((sum, p) => sum + p.amount, 0);

  return expectedCollection - actualCollection;
}

/**
 * Get expected monthly due for a participant in a specific month
 *
 * @param participantId - The participant ID
 * @param monthNumber - The month number
 * @param data - All data
 * @returns Expected monthly due
 */
export function getParticipantMonthlyDue(
  participantId: string,
  monthNumber: number,
  data: ChitFundData
): number {
  const participant = data.participants.find((p) => p.id === participantId);
  if (!participant) {
    throw new Error(`Participant not found: ${participantId}`);
  }

  const chit = data.chits.find((c) => c.id === participant.chitId);
  if (!chit) {
    throw new Error(`Chit not found: ${participant.chitId}`);
  }

  const chitMonth = data.chitMonths.find(
    (cm) => cm.chitId === participant.chitId && cm.monthNumber === monthNumber
  );
  if (!chitMonth) {
    throw new Error(
      `ChitMonth not found: ${participant.chitId}, month ${monthNumber}`
    );
  }

  return getMonthlyDue(chit, chitMonth);
}
