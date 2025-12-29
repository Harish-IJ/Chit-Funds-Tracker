/**
 * Participant Payment Calculations
 *
 * All functions related to participant payments and outstanding amounts
 */

import type { Payment, ChitFundData } from "@/types/chit.types";
import { getParticipantMonthlyDue } from "./dues";

/**
 * Get all payments made by a participant
 *
 * @param participantId - The participant ID
 * @param payments - All payments
 * @returns Array of payments made by this participant
 */
export function getParticipantPayments(
  participantId: string,
  payments: Payment[]
): Payment[] {
  return payments.filter((p) => p.participantId === participantId);
}

/**
 * Calculate total amount paid by a participant
 *
 * @param participantId - The participant ID
 * @param payments - All payments
 * @returns Total amount paid
 */
export function getParticipantTotalPaid(
  participantId: string,
  payments: Payment[]
): number {
  return getParticipantPayments(participantId, payments).reduce(
    (sum, p) => sum + p.amount,
    0
  );
}

/**
 * Calculate outstanding amount for a participant
 *
 * Outstanding = (total expected for all completed months) - (total paid)
 *
 * IMPORTANT: This accounts for:
 * - Partial payments
 * - Advance payments (only if all previous months are paid)
 * - Different monthly dues for different months
 *
 * @param participantId - The participant ID
 * @param data - All data
 * @param upToMonth - Calculate outstanding up to this month (default: all months)
 * @returns Outstanding amount (positive means owes money, negative means overpaid)
 */
export function getParticipantOutstanding(
  participantId: string,
  data: ChitFundData,
  upToMonth?: number
): number {
  const participant = data.participants.find((p) => p.id === participantId);
  if (!participant) {
    throw new Error(`Participant not found: ${participantId}`);
  }

  const chitMonths = data.chitMonths
    .filter((cm) => cm.chitId === participant.chitId)
    .sort((a, b) => a.monthNumber - b.monthNumber);

  // Determine the maximum month to calculate for
  const maxMonth =
    upToMonth ?? Math.max(...chitMonths.map((cm) => cm.monthNumber));

  // Calculate total expected for all months up to maxMonth
  let totalExpected = 0;
  for (const chitMonth of chitMonths) {
    if (chitMonth.monthNumber <= maxMonth) {
      totalExpected += getParticipantMonthlyDue(
        participantId,
        chitMonth.monthNumber,
        data
      );
    }
  }

  // Calculate total paid
  const totalPaid = getParticipantTotalPaid(participantId, data.payments);

  return totalExpected - totalPaid;
}

/**
 * Get payment status for a participant in a specific month
 *
 * @param participantId - The participant ID
 * @param monthNumber - The month number
 * @param data - All data
 * @returns Payment status: 'paid' | 'partial' | 'unpaid' | 'overpaid'
 */
export function getParticipantMonthStatus(
  participantId: string,
  monthNumber: number,
  data: ChitFundData
): "paid" | "partial" | "unpaid" | "overpaid" {
  const expectedDue = getParticipantMonthlyDue(
    participantId,
    monthNumber,
    data
  );

  const paidAmount = data.payments
    .filter(
      (p) => p.participantId === participantId && p.monthNumber === monthNumber
    )
    .reduce((sum, p) => sum + p.amount, 0);

  if (paidAmount === 0) {
    return "unpaid";
  } else if (paidAmount < expectedDue) {
    return "partial";
  } else if (paidAmount === expectedDue) {
    return "paid";
  } else {
    return "overpaid";
  }
}

/**
 * Check if a participant has paid all months up to a given month
 * This is used to validate advance payments
 *
 * @param participantId - The participant ID
 * @param upToMonth - Check up to this month
 * @param data - All data
 * @returns True if all months are paid
 */
export function hasParticipantPaidAllPreviousMonths(
  participantId: string,
  upToMonth: number,
  data: ChitFundData
): boolean {
  const participant = data.participants.find((p) => p.id === participantId);
  if (!participant) {
    return false;
  }

  const chitMonths = data.chitMonths
    .filter(
      (cm) => cm.chitId === participant.chitId && cm.monthNumber < upToMonth
    )
    .sort((a, b) => a.monthNumber - b.monthNumber);

  for (const chitMonth of chitMonths) {
    const status = getParticipantMonthStatus(
      participantId,
      chitMonth.monthNumber,
      data
    );
    if (status === "unpaid" || status === "partial") {
      return false;
    }
  }

  return true;
}
