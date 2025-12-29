/**
 * Calculation Functions - Central Export
 *
 * All pure calculation functions for the chit fund system.
 * These functions have NO side effects and are fully testable.
 */

// Commission calculations
export { getCommissionAmount } from "./commission";

// Dues and monthly calculations
export {
  getMonthlyDue,
  getWinnerPayout,
  getTotalExpectedContribution,
  getMonthShortfall,
  getParticipantMonthlyDue,
} from "./dues";

// Participant calculations
export {
  getParticipantPayments,
  getParticipantTotalPaid,
  getParticipantOutstanding,
  getParticipantMonthStatus,
  hasParticipantPaidAllPreviousMonths,
} from "./participant";

// Profit and cash calculations
export {
  getChitProfit,
  getCompanyCashBalance,
  getChitCashBalance,
  getTotalOutstanding,
} from "./profit";
