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
import { addParticipantSchema, type AddParticipantFormData } from "@/lib/validation/schemas";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import type { Participant } from "@/types/chit.types";
import { toast } from "sonner";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChitId?: string;
}

export function AddParticipantDialog({
  open,
  onOpenChange,
  defaultChitId,
}: AddParticipantDialogProps) {
  const { data, addParticipant } = useChitFund();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddParticipantFormData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      name: "",
      chitId: defaultChitId || "",
      role: "external",
      status: "active",
    },
  });

  const onSubmit = async (formData: AddParticipantFormData) => {
    setIsSubmitting(true);
    try {
      const selectedChit = data.chits.find((c) => c.id === formData.chitId);
      if (!selectedChit) {
        throw new Error("Chit not found");
      }

      // Check if participant count is already at max
      const currentParticipants = data.participants.filter((p) => p.chitId === formData.chitId);
      if (currentParticipants.length >= selectedChit.participantsCount) {
        throw new Error(
          `Maximum ${selectedChit.participantsCount} participants allowed for this chit`
        );
      }

      const newParticipant: Participant = {
        id: generateId("p"),
        name: formData.name,
        chitId: formData.chitId,
        role: formData.role,
        status: formData.status,
      };

      addParticipant(newParticipant);

      toast.success(
        `Participant added! ${newParticipant.name} added to ${selectedChit.name || selectedChit.id}`
      );

      form.reset({
        name: "",
        chitId: defaultChitId || "",
        role: "external",
        status: "active",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add participant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>Add a new participant to a chit fund.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rajesh Kumar" {...field} />
                  </FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="external">External</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isSubmitting ? "Adding..." : "Add Participant"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
