/**
 * Test Data Seed
 *
 * Comprehensive test scenarios covering all requirements:
 * 1. Auction month
 * 2. Company month
 * 3. Partial payment
 * 4. Advance payment (only if previous months paid)
 * 5. Unpaid month
 * 6. Company cash injection
 */

import type { ChitFundData } from "@/types/chit.types";

export const testData: ChitFundData = {
  chits: [
    {
      id: "chit-1",
      name: "Test Chit Fund 500K",
      schemeValue: 500000,
      participantsCount: 20,
      durationMonths: 20,
      commissionPercent: 0.03,
      status: "active",
      startDate: "2025-01-01",
    },
  ],

  chitMonths: [
    // Month 1: Auction month - Winner: Ajay, Auction: 150,000
    {
      id: "chit-1-month-1",
      chitId: "chit-1",
      monthNumber: 1,
      type: "auction",
      auctionAmount: 150000,
      winnerParticipantId: "p-3",
      date: "2025-01-01",
    },

    // Month 2: Company month - No auction
    {
      id: "chit-1-month-2",
      chitId: "chit-1",
      monthNumber: 2,
      type: "company",
      date: "2025-02-01",
    },

    // Month 3: Auction month - Winner: Priya, Auction: 100,000
    {
      id: "chit-1-month-3",
      chitId: "chit-1",
      monthNumber: 3,
      type: "auction",
      auctionAmount: 100000,
      winnerParticipantId: "p-5",
      date: "2025-03-01",
    },
  ],

  participants: [
    {
      id: "p-1",
      name: "Rahul Kumar",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-2",
      name: "Sita Sharma",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-3",
      name: "Ajay Patel",
      chitId: "chit-1",
      role: "external",
      status: "won", // Won in month 1
    },
    {
      id: "p-4",
      name: "Deepak Singh",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-5",
      name: "Priya Reddy",
      chitId: "chit-1",
      role: "external",
      status: "won", // Won in month 3
    },
    {
      id: "p-6",
      name: "Vijay Mehta",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-7",
      name: "Anita Gupta",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-8",
      name: "Ravi Nair",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-9",
      name: "Lakshmi Iyer",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-10",
      name: "Suresh Rao",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-11",
      name: "Meera Joshi",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-12",
      name: "Arun Kumar",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-13",
      name: "Pooja Shah",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-14",
      name: "Kiran Reddy",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-15",
      name: "Naveen Kumar",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-16",
      name: "Sneha Desai",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-17",
      name: "Manoj Pillai",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-18",
      name: "Radha Krishna",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-19",
      name: "Ganesh Iyer",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
    {
      id: "p-20",
      name: "Kavita Nair",
      chitId: "chit-1",
      role: "external",
      status: "active",
    },
  ],

  payments: [
    // Month 1 Payments (Auction month, due: 18,250 per participant)
    // Most participants paid in full
    {
      id: "pay-1",
      participantId: "p-1",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-05",
    },
    {
      id: "pay-2",
      participantId: "p-2",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-05",
    },
    {
      id: "pay-3",
      participantId: "p-3",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-05",
    },
    {
      id: "pay-4",
      participantId: "p-4",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-06",
    },
    {
      id: "pay-5",
      participantId: "p-5",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-06",
    },
    {
      id: "pay-6",
      participantId: "p-6",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-07",
    },
    {
      id: "pay-7",
      participantId: "p-7",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-08",
    },
    {
      id: "pay-8",
      participantId: "p-8",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-08",
    },
    {
      id: "pay-9",
      participantId: "p-9",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-09",
    },
    {
      id: "pay-10",
      participantId: "p-10",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-10",
    },
    {
      id: "pay-11",
      participantId: "p-11",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-11",
    },
    {
      id: "pay-12",
      participantId: "p-12",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-12",
    },
    {
      id: "pay-13",
      participantId: "p-13",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-13",
    },
    {
      id: "pay-14",
      participantId: "p-14",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-14",
    },
    {
      id: "pay-15",
      participantId: "p-15",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-15",
    },
    {
      id: "pay-16",
      participantId: "p-16",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-16",
    },
    {
      id: "pay-17",
      participantId: "p-17",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-17",
    },

    // p-18: Partial payment (only 10,000 instead of 18,250)
    {
      id: "pay-18",
      participantId: "p-18",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 10000,
      date: "2025-01-18",
      note: "Partial payment",
    },

    // p-19: Full payment
    {
      id: "pay-19",
      participantId: "p-19",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 18250,
      date: "2025-01-19",
    },

    // p-20: No payment for month 1 (will create a due)

    // Month 2 Payments (Company month, due: 25,000 per participant)
    {
      id: "pay-21",
      participantId: "p-1",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-05",
    },
    {
      id: "pay-22",
      participantId: "p-2",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-05",
    },
    {
      id: "pay-23",
      participantId: "p-3",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-05",
    },
    {
      id: "pay-24",
      participantId: "p-4",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-06",
    },
    {
      id: "pay-25",
      participantId: "p-5",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-06",
    },
    {
      id: "pay-26",
      participantId: "p-6",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-07",
    },
    {
      id: "pay-27",
      participantId: "p-7",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-08",
    },
    {
      id: "pay-28",
      participantId: "p-8",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-08",
    },
    {
      id: "pay-29",
      participantId: "p-9",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-09",
    },
    {
      id: "pay-30",
      participantId: "p-10",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-10",
    },
    {
      id: "pay-31",
      participantId: "p-11",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-11",
    },
    {
      id: "pay-32",
      participantId: "p-12",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-12",
    },
    {
      id: "pay-33",
      participantId: "p-13",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-13",
    },
    {
      id: "pay-34",
      participantId: "p-14",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-14",
    },
    {
      id: "pay-35",
      participantId: "p-15",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-15",
    },

    // p-16: Advance payment for month 3 (already paid months 1 & 2)
    {
      id: "pay-36",
      participantId: "p-16",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-16",
    },

    {
      id: "pay-37",
      participantId: "p-17",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-17",
    },

    // p-18: Completes month 1 partial payment + pays month 2
    {
      id: "pay-38",
      participantId: "p-18",
      chitId: "chit-1",
      monthNumber: 1,
      amount: 8250,
      date: "2025-02-18",
      note: "Completing month 1",
    },
    {
      id: "pay-39",
      participantId: "p-18",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-18",
    },

    {
      id: "pay-40",
      participantId: "p-19",
      chitId: "chit-1",
      monthNumber: 2,
      amount: 25000,
      date: "2025-02-19",
    },

    // p-20: Still hasn't paid month 1, so cannot pay for month 2 yet
    // (Will remain unpaid for month 1 and 2)

    // p-16: Advance payment for month 3 (paid after completing months 1 & 2)
    {
      id: "pay-41",
      participantId: "p-16",
      chitId: "chit-1",
      monthNumber: 3,
      amount: 20750,
      date: "2025-02-20",
      note: "Advance payment for month 3",
    },

    // Month 3 Payments (Auction month, due: 20,750 per participant)
    // Only a few early payments so far
    {
      id: "pay-42",
      participantId: "p-1",
      chitId: "chit-1",
      monthNumber: 3,
      amount: 20750,
      date: "2025-03-05",
    },
    {
      id: "pay-43",
      participantId: "p-2",
      chitId: "chit-1",
      monthNumber: 3,
      amount: 20750,
      date: "2025-03-05",
    },
    {
      id: "pay-44",
      participantId: "p-3",
      chitId: "chit-1",
      monthNumber: 3,
      amount: 20750,
      date: "2025-03-05",
    },
  ],

  companyCashMovements: [
    // Winner payout for month 1
    {
      id: "ccm-1",
      chitId: "chit-1",
      monthNumber: 1,
      type: "winner_payout",
      amount: 350000, // 500,000 - 150,000
      reason: "Payout to Ajay Patel (winner of month 1 auction)",
      date: "2025-01-10",
    },

    // Company injects cash to cover month 1 shortfall
    // Expected: 365,000 (18,250 × 20)
    // Actual: 337,750 (missing p-20's payment and p-18's partial)
    // Shortfall: 27,250
    {
      id: "ccm-2",
      chitId: "chit-1",
      monthNumber: 1,
      type: "outside_cash_injected",
      amount: 30000,
      reason: "Covered payout shortfall due to unpaid dues",
      date: "2025-01-10",
    },

    // Winner payout for month 3
    {
      id: "ccm-3",
      chitId: "chit-1",
      monthNumber: 3,
      type: "winner_payout",
      amount: 400000, // 500,000 - 100,000
      reason: "Payout to Priya Reddy (winner of month 3 auction)",
      date: "2025-03-10",
    },
  ],
  duesRecoveries: [],
};
