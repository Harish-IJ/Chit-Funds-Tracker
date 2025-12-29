import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  IndianRupee,
  Trophy,
  Users,
  Target,
  CreditCard,
} from "lucide-react";
import { RecordPaymentDialog } from "@/components/dialogs/RecordPaymentDialog";
import {
  getMonthlyDue,
  getWinnerPayout,
  getMonthShortfall,
  getParticipantMonthStatus,
  getParticipantMonthlyDue,
} from "@/lib/calculations";

export function MonthDetail() {
  const { chitId, monthNumber } = useParams<{
    chitId: string;
    monthNumber: string;
  }>();
  const { data } = useChitFund();
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const chit = data.chits.find((c) => c.id === chitId);
  const month = data.chitMonths.find(
    (cm) => cm.chitId === chitId && cm.monthNumber === parseInt(monthNumber!)
  );
  const participants = data.participants.filter((p) => p.chitId === chitId);

  if (!chit || !month) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Chit month not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const monthlyDue = getMonthlyDue(chit, month);
  const expectedCollection = monthlyDue * chit.participantsCount;
  const shortfall = getMonthShortfall(chitId!, month.monthNumber, data);
  const winnerPayout = month.type === "auction" ? getWinnerPayout(chit, month) : 0;
  const winner = month.winnerParticipantId
    ? participants.find((p) => p.id === month.winnerParticipantId)
    : null;

  const actualCollection = data.payments
    .filter((p) => p.chitId === chitId && p.monthNumber === month.monthNumber)
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate participant statuses
  const participantPayments = participants.map((participant) => {
    const payments = data.payments.filter(
      (p) => p.participantId === participant.id && p.monthNumber === month.monthNumber
    );
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const expected = getParticipantMonthlyDue(participant.id, month.monthNumber, data);
    const status = getParticipantMonthStatus(participant.id, month.monthNumber, data);
    const outstanding = expected - paid;

    return {
      participant,
      paid,
      expected,
      outstanding,
      status,
      payments,
    };
  });

  const paidCount = participantPayments.filter(
    (p) => p.status === "paid" || p.status === "overpaid"
  ).length;
  const unpaidCount = participantPayments.filter((p) => p.status === "unpaid").length;
  const partialCount = participantPayments.filter((p) => p.status === "partial").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/chit/${chitId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                {chit.name || `Chit ${chit.id}`} - Month {month.monthNumber}
              </h1>
              <Badge variant={month.type === "auction" ? "default" : "secondary"}>
                {month.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Payment status and collection details
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setRecordPaymentOpen(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        defaultChitId={chitId}
        defaultMonthNumber={parseInt(monthNumber!)}
      />

      {/* Shortfall Alert */}
      {shortfall > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Collection Shortfall</AlertTitle>
          <AlertDescription>
            ₹{shortfall.toLocaleString("en-IN")} pending collection
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due/Person</p>
                <p className="text-lg font-semibold">₹{monthlyDue.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected</p>
                <p className="text-lg font-semibold">
                  ₹{expectedCollection.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  actualCollection < expectedCollection ? "bg-destructive/10" : "bg-green-500/10"
                }`}
              >
                <IndianRupee
                  className={`h-4 w-4 ${
                    actualCollection < expectedCollection ? "text-destructive" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collected</p>
                <p
                  className={`text-lg font-semibold ${
                    actualCollection < expectedCollection ? "text-destructive" : ""
                  }`}
                >
                  ₹{actualCollection.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {month.type === "auction" && (
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Trophy className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Winner Payout</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{winnerPayout.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auction Details */}
      {month.type === "auction" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Auction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Auction Amount</p>
                <p className="text-xl font-semibold">
                  ₹{month.auctionAmount?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Winner</p>
                <p className="text-xl font-semibold">{winner?.name || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payout</p>
                <p className="text-xl font-semibold text-green-600">
                  ₹{winnerPayout.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-xl font-semibold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Partial</p>
                <p className="text-xl font-semibold">{partialCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unpaid</p>
                <p className="text-xl font-semibold">{unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participant Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantPayments
                .sort((a, b) => a.participant.name.localeCompare(b.participant.name))
                .map(({ participant, paid, expected, outstanding, status }) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>₹{expected.toLocaleString("en-IN")}</TableCell>
                    <TableCell className={paid < expected ? "text-destructive" : ""}>
                      ₹{paid.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {outstanding > 0 ? (
                        <span className="text-destructive font-medium">
                          ₹{outstanding.toLocaleString("en-IN")}
                        </span>
                      ) : outstanding < 0 ? (
                        <span className="text-green-600 font-medium">
                          +₹{Math.abs(outstanding).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "paid" || status === "overpaid"
                            ? "default"
                            : status === "partial"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
