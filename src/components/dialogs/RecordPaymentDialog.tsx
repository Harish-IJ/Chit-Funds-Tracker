import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { recordPaymentSchema, type RecordPaymentFormData } from "@/lib/validation/schemas";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import type { Payment } from "@/types/chit.types";
import { toast } from "sonner";
import {
  getMonthlyDue,
  getParticipantOutstanding,
  hasParticipantPaidAllPreviousMonths,
  getParticipantMonthStatus,
} from "@/lib/calculations";
import { AlertCircle, InfoIcon } from "lucide-react";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParticipantId?: string;
  defaultChitId?: string;
  defaultMonthNumber?: number;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  defaultParticipantId,
  defaultChitId,
  defaultMonthNumber,
}: RecordPaymentDialogProps) {
  const { data, addPayment } = useChitFund();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      participantId: defaultParticipantId || "",
      chitId: defaultChitId || "",
      monthNumber: defaultMonthNumber || 1,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const participantId = form.watch("participantId");
  const chitId = form.watch("chitId");
  const monthNumber = form.watch("monthNumber");
  const amount = form.watch("amount");

  const selectedChit = data.chits.find((c) => c.id === chitId);
  const selectedParticipant = data.participants.find((p) => p.id === participantId);
  const chitMonths = data.chitMonths.filter((m) => m.chitId === chitId);
  const selectedMonth = chitMonths.find((m) => m.monthNumber === monthNumber);

  // Calculate expected and outstanding
  const expectedDue =
    selectedChit && selectedMonth ? getMonthlyDue(selectedChit, selectedMonth) : 0;

  const outstanding = participantId
    ? getParticipantOutstanding(participantId, data, monthNumber)
    : 0;

  const monthStatus =
    participantId && selectedMonth
      ? getParticipantMonthStatus(participantId, monthNumber, data)
      : null;

  const canAdvancePayment =
    participantId && monthNumber > 1
      ? hasParticipantPaidAllPreviousMonths(participantId, monthNumber - 1, data)
      : true;

  const onSubmit = async (formData: RecordPaymentFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedChit || !selectedMonth) {
        throw new Error("Please select a valid chit and month");
      }

      if (!selectedParticipant) {
        throw new Error("Please select a participant");
      }

      // Validate advance payment
      if (!canAdvancePayment) {
        throw new Error(
          `Cannot record payment for month ${monthNumber}. Previous months must be paid first.`
        );
      }

      const newPayment: Payment = {
        id: generateId("pay"),
        participantId: formData.participantId,
        chitId: formData.chitId,
        monthNumber: formData.monthNumber,
        amount: formData.amount,
        date: formData.date,
        note: formData.note,
      };

      addPayment(newPayment);

      toast.success(
        `Payment recorded! ₹${formData.amount.toLocaleString("en-IN")} from ${
          selectedParticipant.name
        } for month ${formData.monthNumber}`
      );

      form.reset({
        participantId: defaultParticipantId || "",
        chitId: defaultChitId || "",
        monthNumber: defaultMonthNumber || 1,
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter participants by selected chit
  const relevantParticipants = chitId
    ? data.participants.filter((p) => p.chitId === chitId)
    : data.participants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment from a participant for a specific month.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chit Fund</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chit fund" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data.chits.map((chit) => (
                        <SelectItem key={chit.id} value={chit.id}>
                          {chit.name || chit.id} - ₹{chit.schemeValue.toLocaleString("en-IN")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a participant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relevantParticipants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id}>
                          {participant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month Number</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chitMonths.map((month) => (
                        <SelectItem key={month.id} value={month.monthNumber.toString()}>
                          Month {month.monthNumber} -{" "}
                          {month.type === "auction" ? "Auction" : "Company"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment info alert */}
            {expectedDue > 0 && participantId && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="space-y-1">
                  <div className="flex justify-between">
                    <span>Expected Monthly Due:</span>
                    <span className="font-semibold">₹{expectedDue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Outstanding:</span>
                    <span
                      className={`font-semibold ${
                        outstanding > 0 ? "text-destructive" : "text-green-600"
                      }`}
                    >
                      ₹{Math.abs(outstanding).toLocaleString("en-IN")}{" "}
                      {outstanding < 0 && "(Overpaid)"}
                    </span>
                  </div>
                  {monthStatus && (
                    <div className="flex justify-between">
                      <span>Month {monthNumber} Status:</span>
                      <span className="font-semibold capitalize">{monthStatus}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Advance payment warning */}
            {!canAdvancePayment && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cannot record payment for month {monthNumber}. Previous months must be paid first.
                </AlertDescription>
              </Alert>
            )}

            {/* Overpayment warning */}
            {amount > expectedDue && expectedDue > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment amount (₹{amount.toLocaleString("en-IN")}) exceeds expected due (₹
                  {expectedDue.toLocaleString("en-IN")}). This will be recorded as an overpayment.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={expectedDue > 0 ? `Suggested: ${expectedDue}` : "Enter amount"}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Enter the payment amount received</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Partial payment, Advance payment, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !canAdvancePayment}>
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
