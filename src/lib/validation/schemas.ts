import * as z from "zod";

// Add Chit Form Schema
export const addChitSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional().or(z.literal("")),
  schemeValue: z.number().min(10000, "Scheme value must be at least ₹10,000"),
  participantsCount: z.number().min(5, "Minimum 5 participants").max(50, "Maximum 50 participants"),
  durationMonths: z.number().min(6, "Minimum 6 months").max(60, "Maximum 60 months"),
  commissionPercent: z.number().min(0, "Cannot be negative").max(0.1, "Maximum 10%"),
});

export type AddChitFormData = z.infer<typeof addChitSchema>;

// Add Participant Form Schema
export const addParticipantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  chitId: z.string().min(1, "Please select a chit fund"),
  role: z.enum(["external", "internal", "company"]),
  status: z.enum(["active", "inactive", "won"]),
});

export type AddParticipantFormData = z.infer<typeof addParticipantSchema>;

// Add Month Form Schema
export const addMonthSchema = z
  .object({
    chitId: z.string().min(1, "Please select a chit fund"),
    monthNumber: z.number().min(1, "Month number must be positive"),
    type: z.enum(["auction", "company"]),
    auctionAmount: z.number().optional(),
    winnerParticipantId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "auction") {
        return data.auctionAmount !== undefined && data.auctionAmount > 0;
      }
      return true;
    },
    {
      message: "Auction amount is required for auction months",
      path: ["auctionAmount"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "auction") {
        return data.winnerParticipantId !== undefined && data.winnerParticipantId.length > 0;
      }
      return true;
    },
    {
      message: "Winner is required for auction months",
      path: ["winnerParticipantId"],
    }
  );

export type AddMonthFormData = z.infer<typeof addMonthSchema>;

// Record Payment Form Schema
export const recordPaymentSchema = z.object({
  participantId: z.string().min(1, "Please select a participant"),
  chitId: z.string().min(1, "Please select a chit fund"),
  monthNumber: z.number().min(1, "Please select a month"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  date: z.string(),
  note: z.string().optional(),
});

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

// Cash Movement Form Schema
export const cashMovementSchema = z.object({
  chitId: z.string().min(1, "Please select a chit fund"),
  monthNumber: z.number().min(1, "Please select a month"),
  type: z.enum(["outside_cash_injected", "cash_withdrawn", "winner_payout"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  date: z.string().optional(),
});

export type CashMovementFormData = z.infer<typeof cashMovementSchema>;
