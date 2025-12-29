import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";
import {
  getCommissionAmount,
  getMonthlyDue,
  getWinnerPayout,
  getMonthShortfall,
} from "@/lib/calculations";
import { AddParticipantDialog } from "@/components/dialogs/AddParticipantDialog";
import { AddMonthDialog } from "@/components/dialogs/AddMonthDialog";
import { RecordPaymentDialog } from "@/components/dialogs/RecordPaymentDialog";

export function ChitDetail() {
  const { chitId } = useParams<{ chitId: string }>();
  const { data } = useChitFund();

  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [addMonthOpen, setAddMonthOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const chit = data.chits.find((c) => c.id === chitId);
  const chitMonths = data.chitMonths
    .filter((cm) => cm.chitId === chitId)
    .sort((a, b) => a.monthNumber - b.monthNumber);
  const participants = data.participants.filter((p) => p.chitId === chitId);

  if (!chit) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Badge>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{chit.name || `Chit ${chit.id}`}</h1>
          <p className="text-muted-foreground">Detailed view and monthly breakdown</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
          <Button variant="outline" onClick={() => setAddMonthOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Add Month
          </Button>
          <Button onClick={() => setRecordPaymentOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
        <Badge
          variant={chit.status === "active" ? "default" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {chit.status}
        </Badge>
      </div>

      {/* Dialogs */}
      <AddParticipantDialog
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
        defaultChitId={chitId}
      />
      <AddMonthDialog open={addMonthOpen} onOpenChange={setAddMonthOpen} defaultChitId={chitId} />
      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        defaultChitId={chitId}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheme Value</CardDescription>
            <CardTitle className="text-2xl">₹{chit.schemeValue.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commission</CardDescription>
            <CardTitle className="text-2xl">₹{commission.toLocaleString("en-IN")}</CardTitle>
            <CardDescription className="text-xs">{chit.commissionPercent * 100}%</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Participants</CardDescription>
            <CardTitle className="text-2xl">
              {participants.length} / {chit.participantsCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progress</CardDescription>
            <CardTitle className="text-2xl">
              {chitMonths.length} / {chit.durationMonths}
            </CardTitle>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>
            Detailed information for each month including auctions, collections, and payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Month</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monthly Due</TableHead>
                <TableHead>Expected Collection</TableHead>
                <TableHead>Actual Collection</TableHead>
                <TableHead>Shortfall</TableHead>
                <TableHead>Auction Amount</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Payout</TableHead>
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
                const winnerPayout = month.type === "auction" ? getWinnerPayout(chit, month) : 0;
                const winner = month.winnerParticipantId
                  ? participants.find((p) => p.id === month.winnerParticipantId)
                  : null;

                return (
                  <TableRow key={month.id}>
                    <TableCell className="font-medium">
                      <Link to={`/chit/${chitId}/month/${month.monthNumber}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {month.monthNumber}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={month.type === "auction" ? "default" : "secondary"}>
                        {month.type}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{monthlyDue.toLocaleString("en-IN")}</TableCell>
                    <TableCell>₹{expectedCollection.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <span
                        className={actualCollection < expectedCollection ? "text-destructive" : ""}
                      >
                        ₹{actualCollection.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {shortfall > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <TrendingDown className="h-3 w-3" />₹{shortfall.toLocaleString("en-IN")}
                        </Badge>
                      ) : shortfall < 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />₹
                          {Math.abs(shortfall).toLocaleString("en-IN")}
                        </Badge>
                      ) : (
                        <Badge variant="outline">-</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {month.type === "auction" && month.auctionAmount
                        ? `₹${month.auctionAmount.toLocaleString("en-IN")}`
                        : "-"}
                    </TableCell>
                    <TableCell>{winner ? winner.name : "-"}</TableCell>
                    <TableCell>
                      {winnerPayout > 0 ? `₹${winnerPayout.toLocaleString("en-IN")}` : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {chitMonths.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No months recorded yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
