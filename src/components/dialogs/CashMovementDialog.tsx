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
import { cashMovementSchema, type CashMovementFormData } from "@/lib/validation/schemas";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import type { CompanyCashMovement } from "@/types/chit.types";
import { toast } from "sonner";

interface CashMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChitId?: string;
}

export function CashMovementDialog({ open, onOpenChange, defaultChitId }: CashMovementDialogProps) {
  const { data, addCashMovement } = useChitFund();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CashMovementFormData>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: {
      chitId: defaultChitId || "",
      monthNumber: 1,
      type: "outside_cash_injected",
      amount: 0,
      reason: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const chitId = form.watch("chitId");
  const movementType = form.watch("type");

  const chitMonths = data.chitMonths.filter((m) => m.chitId === chitId);
  const selectedChit = data.chits.find((c) => c.id === chitId);

  const onSubmit = async (formData: CashMovementFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedChit) {
        throw new Error("Please select a chit fund");
      }

      const newMovement: CompanyCashMovement = {
        id: generateId("cash"),
        chitId: formData.chitId,
        monthNumber: formData.monthNumber,
        type: formData.type,
        amount: formData.amount,
        reason: formData.reason,
        date: formData.date || new Date().toISOString().split("T")[0],
      };

      addCashMovement(newMovement);

      const typeLabel =
        formData.type === "outside_cash_injected"
          ? "Cash Injection"
          : formData.type === "cash_withdrawn"
          ? "Cash Withdrawal"
          : "Winner Payout";

      toast.success(
        `Cash movement recorded! ${typeLabel}: ₹${formData.amount.toLocaleString("en-IN")} for ${
          selectedChit.name || selectedChit.id
        }`
      );

      form.reset({
        chitId: defaultChitId || "",
        monthNumber: 1,
        type: "outside_cash_injected",
        amount: 0,
        reason: "",
        date: new Date().toISOString().split("T")[0],
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record cash movement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Cash Movement</DialogTitle>
          <DialogDescription>
            Track cash injections, withdrawals, or winner payouts for a chit fund.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movement Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outside_cash_injected">
                        Cash Injection (Company → Chit)
                      </SelectItem>
                      <SelectItem value="cash_withdrawn">
                        Cash Withdrawal (Chit → Company)
                      </SelectItem>
                      <SelectItem value="winner_payout">Winner Payout</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>The month this cash movement is associated with</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {movementType === "outside_cash_injected"
                      ? "Amount being injected into the chit fund"
                      : movementType === "cash_withdrawn"
                      ? "Amount being withdrawn from the chit fund"
                      : "Amount paid to the auction winner"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Covering month 1 shortfall, Emergency withdrawal, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain why this cash movement is necessary (minimum 10 characters)
                  </FormDescription>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Movement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
