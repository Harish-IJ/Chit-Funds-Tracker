import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addMonthSchema, type AddMonthFormData } from "@/lib/validation/schemas";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import type { ChitMonth } from "@/types/chit.types";
import { toast } from "sonner";

interface AddMonthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChitId?: string;
  editMonth?: ChitMonth;
}

export function AddMonthDialog({
  open,
  onOpenChange,
  defaultChitId,
  editMonth,
}: AddMonthDialogProps) {
  const { data, addChitMonth, updateChitMonth } = useChitFund();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddMonthFormData>({
    resolver: zodResolver(addMonthSchema),
    defaultValues: {
      chitId: defaultChitId || "",
      monthNumber: 1,
      type: "auction",
      auctionAmount: undefined,
      winnerParticipantId: "",
    },
  });

  const selectedChitId = form.watch("chitId");
  const monthType = form.watch("type");

  const selectedChit = data.chits.find((c) => c.id === selectedChitId);
  const chitMonths = data.chitMonths.filter((m) => m.chitId === selectedChitId);
  const participants = data.participants.filter(
    (p) => p.chitId === selectedChitId && p.status === "active"
  );

  // Auto-suggest next month number (only when NOT editing)
  useEffect(() => {
    if (editMonth) return; // Skip when editing
    if (selectedChitId && chitMonths.length > 0) {
      const maxMonth = Math.max(...chitMonths.map((m) => m.monthNumber));
      form.setValue("monthNumber", maxMonth + 1);
    } else if (selectedChitId) {
      form.setValue("monthNumber", 1);
    }
  }, [selectedChitId, chitMonths, form, editMonth]);

  // Pre-populate form when editing
  useEffect(() => {
    if (editMonth && open) {
      form.reset({
        chitId: editMonth.chitId,
        monthNumber: editMonth.monthNumber,
        type: editMonth.type,
        auctionAmount: editMonth.auctionAmount,
        winnerParticipantId: editMonth.winnerParticipantId || "",
      });
    } else if (open && !editMonth) {
      form.reset({
        chitId: defaultChitId || "",
        monthNumber: 1,
        type: "auction",
        auctionAmount: undefined,
        winnerParticipantId: "",
      });
    }
  }, [editMonth, open, defaultChitId, form]);

  const onSubmit = async (formData: AddMonthFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedChit) {
        throw new Error("Chit not found");
      }

      // Validate month number sequence
      if (formData.monthNumber > selectedChit.durationMonths) {
        throw new Error(`Month number cannot exceed ${selectedChit.durationMonths}`);
      }

      // Check for duplicate month (skip if editing same month)
      const existingMonth = chitMonths.find(
        (m) => m.monthNumber === formData.monthNumber && m.id !== editMonth?.id
      );
      if (existingMonth) {
        throw new Error(`Month ${formData.monthNumber} already exists`);
      }

      // For auction months, validate auction amount
      if (formData.type === "auction" && formData.auctionAmount! >= selectedChit.schemeValue) {
        throw new Error("Auction amount must be less than scheme value");
      }

      if (editMonth) {
        // Update existing month
        updateChitMonth(editMonth.id, {
          type: formData.type,
          ...(formData.type === "auction" && {
            auctionAmount: formData.auctionAmount!,
            winnerParticipantId: formData.winnerParticipantId!,
          }),
        });
        toast.success(`Month ${formData.monthNumber} updated successfully`);
      } else {
        // Create new month
        const newMonth: ChitMonth = {
          id: generateId("month"),
          chitId: formData.chitId,
          monthNumber: formData.monthNumber,
          type: formData.type,
          ...(formData.type === "auction" && {
            auctionAmount: formData.auctionAmount!,
            winnerParticipantId: formData.winnerParticipantId!,
          }),
        };

        addChitMonth(newMonth);
        toast.success(`Month ${formData.monthNumber} added successfully`);
      }

      form.reset({
        chitId: defaultChitId || "",
        monthNumber: formData.monthNumber + 1,
        type: "auction",
        auctionAmount: undefined,
        winnerParticipantId: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save month");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMonth ? "Edit Month" : "Add Month"}</DialogTitle>
          <DialogDescription>
            Create a new auction or company month for a chit fund.
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
              name="monthNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedChit
                      ? `Next available: ${
                          Math.max(...chitMonths.map((m) => m.monthNumber), 0) + 1
                        } (Max: ${selectedChit.durationMonths})`
                      : "Select a chit first"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Month Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auction" id="auction" />
                        <Label htmlFor="auction">Auction</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company">Company</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {monthType === "auction" && (
              <>
                <FormField
                  control={form.control}
                  name="auctionAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={selectedChit ? `Max: ${selectedChit.schemeValue}` : ""}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Amount to be auctioned (must be less than scheme value)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="winnerParticipantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Winner</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select winner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {participants.map((participant) => (
                            <SelectItem key={participant.id} value={participant.id}>
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Active participant who wins the auction</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                {isSubmitting ? "Adding..." : "Add Month"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
