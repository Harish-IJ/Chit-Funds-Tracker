/**
 * Profit and Cash Flow Calculations
 *
 * CRITICAL: Profit ≠ Cash Flow
 * - Profit = Commission collected
 * - Cash = Actual money in/out
 * - Unpaid dues are NOT profit
 */

import type { ChitFundData } from "@/types/chit.types";
import { getCommissionAmount } from "./commission";
import { getMonthlyDue, getWinnerPayout } from "./dues";
import { getParticipantOutstanding } from "./participant";

/**
 * Calculate total profit for a chit
 *
 * Profit = Total Commission Collected (NOT just expected)
 *
 * Commission is embedded in monthly collections for auction months.
 * For company months, there's no commission collected.
 *
 * @param chitId - The chit ID
 * @param data - All data
 * @returns Total profit
 */
export function getChitProfit(chitId: string, data: ChitFundData): number {
  const chit = data.chits.find((c) => c.id === chitId);
  if (!chit) {
    throw new Error(`Chit not found: ${chitId}`);
  }

  // Commission is built into auction month collections
  // We need to calculate what portion of payments represents commission

  const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chitId);
  const auctionMonths = chitMonths.filter((cm) => cm.type === "auction");

  // Total commission is based on actual payments
  // Commission is embedded in auction month collections

  let totalCommissionCollected = 0;

  for (const month of auctionMonths) {
    const monthlyDue = getMonthlyDue(chit, month);

    // Total payments for this month
    const monthPayments = data.payments
      .filter((p) => p.chitId === chitId && p.monthNumber === month.monthNumber)
      .reduce((sum, p) => sum + p.amount, 0);

    // Expected collection
    const expectedCollection = monthlyDue * chit.participantsCount;

    // Commission portion = (commission / expectedCollection) × actualCollection
    if (expectedCollection > 0) {
      const commissionPortion = getCommissionAmount(chit) / expectedCollection;
      totalCommissionCollected += monthPayments * commissionPortion;
    }
  }

  return totalCommissionCollected;
}

/**
 * Calculate company's total cash balance across all chits
 *
 * Cash = (all payments received)
 *      + (cash injections)
 *      - (payouts to winners)
 *      - (cash withdrawals)
 *
 * @param data - All data
 * @returns Net cash balance
 */
export function getCompanyCashBalance(data: ChitFundData): number {
  // All payments received
  const totalPaymentsReceived = data.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // All payouts to winners
  let totalPayouts = 0;
  for (const movement of data.companyCashMovements) {
    if (movement.type === "winner_payout") {
      totalPayouts += movement.amount;
    }
  }

  // Cash movements (injections - withdrawals)
  let netCashMovements = 0;
  for (const movement of data.companyCashMovements) {
    if (movement.type === "outside_cash_injected") {
      netCashMovements += movement.amount;
    } else if (movement.type === "cash_withdrawn") {
      netCashMovements -= movement.amount;
    }
  }

  return totalPaymentsReceived + netCashMovements - totalPayouts;
}

/**
 * Calculate cash balance for a specific chit
 *
 * @param chitId - The chit ID
 * @param data - All data
 * @returns Cash balance for this chit
 */
export function getChitCashBalance(chitId: string, data: ChitFundData): number {
  // Payments received for this chit
  const paymentsReceived = data.payments
    .filter((p) => p.chitId === chitId)
    .reduce((sum, p) => sum + p.amount, 0);

  // Payouts for this chit
  let payouts = 0;
  const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chitId);
  const chit = data.chits.find((c) => c.id === chitId);

  if (chit) {
    for (const month of chitMonths) {
      if (month.type === "auction") {
        payouts += getWinnerPayout(chit, month);
      }
    }
  }

  // Cash movements for this chit
  let netCashMovements = 0;
  for (const movement of data.companyCashMovements.filter(
    (m) => m.chitId === chitId
  )) {
    if (movement.type === "outside_cash_injected") {
      netCashMovements += movement.amount;
    } else if (movement.type === "cash_withdrawn") {
      netCashMovements -= movement.amount;
    } else if (movement.type === "winner_payout") {
      // Already counted in payouts
    }
  }

  return paymentsReceived + netCashMovements - payouts;
}

/**
 * Calculate total outstanding across all participants in a chit
 * This is NOT profit - it's money owed but not yet received
 *
 * @param chitId - The chit ID
 * @param data - All data
 * @returns Total outstanding amount
 */
export function getTotalOutstanding(
  chitId: string,
  data: ChitFundData
): number {
  const participants = data.participants.filter((p) => p.chitId === chitId);

  let totalOutstanding = 0;
  for (const participant of participants) {
    const outstanding = getParticipantOutstanding(participant.id, data);
    if (outstanding > 0) {
      totalOutstanding += outstanding;
    }
  }

  return totalOutstanding;
}
