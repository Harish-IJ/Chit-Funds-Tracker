import { useState } from "react";
import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { getCommissionAmount } from "@/lib/calculations";
import { AddChitDialog } from "@/components/dialogs/AddChitDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  Users,
  Calendar,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ChitsList() {
  const { data, isLoading, deleteChit, updateChit } = useChitFund();
  const [addChitOpen, setAddChitOpen] = useState(false);
  const [editChit, setEditChit] = useState<(typeof data.chits)[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (chitId: string) => {
    const chit = data.chits.find((c) => c.id === chitId);
    const hasMonths = data.chitMonths.some((m) => m.chitId === chitId);
    const hasParticipants = data.participants.some((p) => p.chitId === chitId);

    if (hasMonths || hasParticipants) {
      toast.error("Cannot delete chit with existing months or participants");
      return;
    }

    deleteChit(chitId);
    toast.success(`Chit "${chit?.name}" deleted`);
    setDeleteConfirm(null);
  };

  const handleMarkComplete = (chitId: string) => {
    updateChit(chitId, { status: "completed" });
    toast.success("Chit marked as completed");
  };

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chit Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your chit fund investments
          </p>
        </div>
        <Button onClick={() => setAddChitOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chit
        </Button>
      </div>

      {/* Dialogs */}
      <AddChitDialog
        open={addChitOpen || !!editChit}
        onOpenChange={(open) => {
          setAddChitOpen(open);
          if (!open) setEditChit(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Chit"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Loading State */}
      {isLoading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IndianRupee className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-lg font-semibold">
                      ₹
                      {data.chits
                        .reduce((sum, c) => sum + c.schemeValue, 0)
                        .toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Chits</p>
                    <p className="text-lg font-semibold">
                      {data.chits.filter((c) => c.status === "active").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="text-lg font-semibold">{data.participants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Months</p>
                    <p className="text-lg font-semibold">{data.chitMonths.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chit Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.chits.map((chit) => {
              const participants = data.participants.filter((p) => p.chitId === chit.id);
              const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chit.id);
              const commission = getCommissionAmount(chit);
              const progress = (chitMonths.length / chit.durationMonths) * 100;

              return (
                <Card key={chit.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Link to={`/chit/${chit.id}`} className="flex-1 space-y-1">
                        <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                          {chit.name || `Chit ${chit.id}`}
                        </CardTitle>
                        <p className="text-2xl font-bold">
                          ₹{chit.schemeValue.toLocaleString("en-IN")}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={chit.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {chit.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditChit(chit)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {chit.status === "active" && (
                              <DropdownMenuItem onClick={() => handleMarkComplete(chit.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm(chit.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <Link to={`/chit/${chit.id}`}>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {chitMonths.length}/{chit.durationMonths} months
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Participants</p>
                          <p className="text-sm font-medium">
                            {participants.length}/{chit.participantsCount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Commission</p>
                          <p className="text-sm font-medium">
                            ₹{commission.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {data.chits.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <IndianRupee className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No chit funds yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first chit fund to get started
              </p>
              <Button onClick={() => setAddChitOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Chit
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
