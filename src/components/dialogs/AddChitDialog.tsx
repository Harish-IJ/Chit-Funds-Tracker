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
import { addChitSchema, type AddChitFormData } from "@/lib/validation/schemas";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import type { Chit } from "@/types/chit.types";
import { toast } from "sonner";

interface AddChitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChitDialog({ open, onOpenChange }: AddChitDialogProps) {
  const { addChit } = useChitFund();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddChitFormData>({
    resolver: zodResolver(addChitSchema),
    defaultValues: {
      name: "",
      schemeValue: 500000,
      participantsCount: 20,
      durationMonths: 20,
      commissionPercent: 0.03,
    },
  });

  const onSubmit = async (data: AddChitFormData) => {
    setIsSubmitting(true);
    try {
      const newChit: Chit = {
        id: generateId("chit"),
        name: data.name || undefined,
        schemeValue: data.schemeValue,
        participantsCount: data.participantsCount,
        durationMonths: data.durationMonths,
        commissionPercent: data.commissionPercent,
        status: "active",
      };

      addChit(newChit);

      toast.success(
        `Chit created successfully! ${
          newChit.name || newChit.id
        } with scheme value ₹${newChit.schemeValue.toLocaleString("en-IN")}`
      );

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create chit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Chit Fund</DialogTitle>
          <DialogDescription>
            Set up a new chit fund with participants and monthly collection details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chit Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Chit Fund 500K" {...field} />
                  </FormControl>
                  <FormDescription>A friendly name for this chit fund</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schemeValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme Value (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Total chit fund value (minimum ₹10,000)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="participantsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>5-50</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>6-60</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="commissionPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.03"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>0-10% (0.03 = 3%)</FormDescription>
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
                {isSubmitting ? "Creating..." : "Create Chit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
