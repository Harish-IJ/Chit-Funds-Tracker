import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  UserPlus,
  CalendarPlus,
  CreditCard,
  Trash2,
  Pencil,
  IndianRupee,
  Users,
  Calendar,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import { getCommissionAmount, getMonthlyDue, getMonthShortfall } from "@/lib/calculations";
import { AddParticipantDialog } from "@/components/dialogs/AddParticipantDialog";
import { AddMonthDialog } from "@/components/dialogs/AddMonthDialog";
import { RecordPaymentDialog } from "@/components/dialogs/RecordPaymentDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CsvImportDialog } from "@/components/dialogs/CsvImportDialog";
import { toast } from "sonner";

export function ChitDetail() {
  const { chitId } = useParams<{ chitId: string }>();
  const { data, deleteChitMonth, deleteParticipant } = useChitFund();

  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [addMonthOpen, setAddMonthOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editMonthId, setEditMonthId] = useState<string | null>(null);
  const [deleteMonthId, setDeleteMonthId] = useState<string | null>(null);
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  const chit = data.chits.find((c) => c.id === chitId);
  const chitMonths = data.chitMonths
    .filter((cm) => cm.chitId === chitId)
    .sort((a, b) => a.monthNumber - b.monthNumber);
  const participants = data.participants.filter((p) => p.chitId === chitId);

  if (!chit) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Chit fund not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const commission = getCommissionAmount(chit);
  const progress = (chitMonths.length / chit.durationMonths) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{chit.name || `Chit ${chit.id}`}</h1>
              <Badge variant={chit.status === "active" ? "default" : "secondary"}>
                {chit.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Scheme Value: ₹{chit.schemeValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Participant
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddMonthOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setRecordPaymentOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddParticipantDialog
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
        defaultChitId={chitId}
      />
      <AddMonthDialog
        open={addMonthOpen || !!editMonthId}
        onOpenChange={(open) => {
          setAddMonthOpen(open);
          if (!open) setEditMonthId(null);
        }}
        defaultChitId={chitId}
        editMonth={editMonthId ? chitMonths.find((m) => m.id === editMonthId) : undefined}
      />
      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        defaultChitId={chitId}
      />
      <CsvImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} chitId={chitId} />

      {/* Delete Dialogs */}
      <ConfirmDialog
        open={!!deleteMonthId}
        onOpenChange={(open) => !open && setDeleteMonthId(null)}
        onConfirm={() => {
          if (deleteMonthId) {
            const month = chitMonths.find((m) => m.id === deleteMonthId);
            const hasPayments = data.payments.some(
              (p) => p.chitId === chitId && p.monthNumber === month?.monthNumber
            );
            if (hasPayments) {
              toast.error("Cannot delete month with payments");
              setDeleteMonthId(null);
              return;
            }
            deleteChitMonth(deleteMonthId);
            toast.success("Month deleted");
            setDeleteMonthId(null);
          }
        }}
        title="Delete Month"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deleteParticipantId}
        onOpenChange={(open) => !open && setDeleteParticipantId(null)}
        onConfirm={() => {
          if (deleteParticipantId) {
            const participant = participants.find((p) => p.id === deleteParticipantId);
            const hasPayments = data.payments.some((p) => p.participantId === deleteParticipantId);
            if (hasPayments) {
              toast.error("Cannot delete participant with payments");
              setDeleteParticipantId(null);
              return;
            }
            deleteParticipant(deleteParticipantId);
            toast.success(`${participant?.name} deleted`);
            setDeleteParticipantId(null);
          }
        }}
        title="Delete Participant"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheme Value</p>
                <p className="text-lg font-semibold">₹{chit.schemeValue.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="text-lg font-semibold">₹{commission.toLocaleString("en-IN")}</p>
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
                <p className="text-lg font-semibold">
                  {participants.length}/{chit.participantsCount}
                </p>
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
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">
                  {chitMonths.length}/{chit.durationMonths}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Duration Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Months Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Month</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due/Person</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Shortfall</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chitMonths.map((month) => {
                const monthlyDue = getMonthlyDue(chit, month);
                const expectedCollection = monthlyDue * chit.participantsCount;
                const actualCollection = data.payments
                  .filter((p) => p.chitId === chitId && p.monthNumber === month.monthNumber)
                  .reduce((sum, p) => sum + p.amount, 0);
                const shortfall = getMonthShortfall(chitId!, month.monthNumber, data);
                const winner = month.winnerParticipantId
                  ? participants.find((p) => p.id === month.winnerParticipantId)
                  : null;

                return (
                  <TableRow key={month.id}>
                    <TableCell>
                      <Link to={`/chit/${chitId}/month/${month.monthNumber}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {month.monthNumber}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={month.type === "auction" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {month.type}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{monthlyDue.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <span
                        className={actualCollection < expectedCollection ? "text-destructive" : ""}
                      >
                        ₹{actualCollection.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {shortfall > 0 ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <TrendingDown className="h-3 w-3" />₹{shortfall.toLocaleString("en-IN")}
                        </Badge>
                      ) : shortfall < 0 ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <TrendingUp className="h-3 w-3" />₹
                          {Math.abs(shortfall).toLocaleString("en-IN")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{winner ? winner.name : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditMonthId(month.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteMonthId(month.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {chitMonths.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No months recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
