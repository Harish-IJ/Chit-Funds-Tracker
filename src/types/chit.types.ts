/**
 * Chit Fund System - Type Definitions
 *
 * These types match the exact JSON schema specified.
 * No derived or calculated fields are included.
 */

/**
 * Status of a chit fund
 */
export type ChitStatus = "active" | "completed" | "pending";

/**
 * Type of month - either auction or company
 */
export type MonthType = "auction" | "company";

/**
 * Role of a participant in the chit fund
 */
export type ParticipantRole = "external" | "internal" | "company";

/**
 * Status of a participant
 */
export type ParticipantStatus = "active" | "inactive" | "won";

/**
 * Type of company cash movement
 */
export type CashMovementType = "outside_cash_injected" | "cash_withdrawn" | "winner_payout";

/**
 * Core Chit entity
 */
export interface Chit {
  id: string;
  schemeValue: number;
  participantsCount: number;
  durationMonths: number;
  commissionPercent: number;
  status: ChitStatus;
  startDate?: string; // ISO date string
  name?: string; // Optional display name
}

/**
 * Monthly data for a chit
 * Can be either an auction month or a company month
 */
export interface ChitMonth {
  id: string;
  chitId: string;
  monthNumber: number;
  type: MonthType;
  auctionAmount?: number; // Only for auction months
  winnerParticipantId?: string; // Only for auction months
  date?: string; // ISO date string for when this month occurred
}

/**
 * Participant in a chit fund
 */
export interface Participant {
  id: string;
  name: string;
  chitId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedMonthNumber?: number; // If joined mid-cycle
}

/**
 * Payment made by a participant
 *
 * monthNumber indicates which month this payment is for.
 * For advance payments: participant must have paid all previous months first.
 */
export interface Payment {
  id: string;
  participantId: string;
  chitId: string;
  monthNumber: number; // Which month this payment is for
  amount: number;
  date: string; // ISO date string
  note?: string; // Optional note for partial/advance payments
}

/**
 * Company cash movement
 * Tracks cash injections and withdrawals
 */
export interface CompanyCashMovement {
  id: string;
  chitId: string;
  monthNumber: number;
  type: CashMovementType;
  amount: number;
  reason: string;
  date: string; // ISO date string
}

/**
 * Dues & Recoveries
 * Track external money owed to/from the company
 */
export type DuesRecoveryType = "due" | "recovery";
export type DuesStatus = "pending" | "partial" | "recovered" | "written_off";

export interface DuesRecovery {
  id: string;
  type: DuesRecoveryType;

  // For "due" type
  amount: number;
  dueDate: string;
  reason: string;
  debtor: string; // Name or ID of person/entity
  status: DuesStatus;

  // For "recovery" type
  dueId?: string; // Links to original due
  recoveredAmount?: number;
  recoveryDate?: string;
  recoveryMethod?: string; // e.g., "Cash", "Bank Transfer"
  note?: string;
  createdDate: string;
}

/**
 * Complete data store structure
 */
export interface ChitFundData {
  chits: Chit[];
  chitMonths: ChitMonth[];
  participants: Participant[];
  payments: Payment[];
  companyCashMovements: CompanyCashMovement[];
  duesRecoveries: DuesRecovery[];
}
