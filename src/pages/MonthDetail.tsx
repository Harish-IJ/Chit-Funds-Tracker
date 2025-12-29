import { useParams, Link } from "react-router-dom";
import { useChitFund } from "@/providers/ChitFundProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
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

  const chit = data.chits.find((c) => c.id === chitId);
  const month = data.chitMonths.find(
    (cm) => cm.chitId === chitId && cm.monthNumber === parseInt(monthNumber!)
  );
  const participants = data.participants.filter((p) => p.chitId === chitId);

  if (!chit || !month) {
    return (
      <div className='container mx-auto p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Chit month not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const monthlyDue = getMonthlyDue(chit, month);
  const expectedCollection = monthlyDue * chit.participantsCount;
  const shortfall = getMonthShortfall(chitId!, month.monthNumber, data);
  const winnerPayout =
    month.type === "auction" ? getWinnerPayout(chit, month) : 0;
  const winner = month.winnerParticipantId
    ? participants.find((p) => p.id === month.winnerParticipantId)
    : null;

  const actualCollection = data.payments
    .filter((p) => p.chitId === chitId && p.monthNumber === month.monthNumber)
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate participant statuses
  const participantPayments = participants.map((participant) => {
    const payments = data.payments.filter(
      (p) =>
        p.participantId === participant.id &&
        p.monthNumber === month.monthNumber
    );
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const expected = getParticipantMonthlyDue(
      participant.id,
      month.monthNumber,
      data
    );
    const status = getParticipantMonthStatus(
      participant.id,
      month.monthNumber,
      data
    );
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
  const unpaidCount = participantPayments.filter(
    (p) => p.status === "unpaid"
  ).length;
  const partialCount = participantPayments.filter(
    (p) => p.status === "partial"
  ).length;

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link to={`/chit/${chitId}`}>
          <Badge variant='outline' className='cursor-pointer hover:bg-accent'>
            <ArrowLeft className='h-3 w-3 mr-1' />
            Back to Chit
          </Badge>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>
            {chit.name || `Chit ${chit.id}`} - Month {month.monthNumber}
          </h1>
          <p className='text-muted-foreground'>
            Payment status and collection details
          </p>
        </div>
        <Badge
          variant={month.type === "auction" ? "default" : "secondary"}
          className='text-lg px-4 py-2'>
          {month.type}
        </Badge>
      </div>

      {/* Shortfall Alert */}
      {shortfall > 0 && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Collection Shortfall Detected</AlertTitle>
          <AlertDescription>
            This month has a shortfall of ₹{shortfall.toLocaleString("en-IN")}.
            Expected: ₹{expectedCollection.toLocaleString("en-IN")}, Collected:
            ₹{actualCollection.toLocaleString("en-IN")}
          </AlertDescription>
        </Alert>
      )}

      {/* Month Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Monthly Due (per participant)</CardDescription>
            <CardTitle className='text-2xl'>
              ₹{monthlyDue.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Expected Collection</CardDescription>
            <CardTitle className='text-2xl'>
              ₹{expectedCollection.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Actual Collection</CardDescription>
            <CardTitle
              className={`text-2xl ${
                actualCollection < expectedCollection ? "text-destructive" : ""
              }`}>
              ₹{actualCollection.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>
        {month.type === "auction" && (
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Winner Payout</CardDescription>
              <CardTitle className='text-2xl'>
                ₹{winnerPayout.toLocaleString("en-IN")}
              </CardTitle>
              {winner && (
                <CardDescription className='text-xs'>
                  To: {winner.name}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Auction Details */}
      {month.type === "auction" && (
        <Card>
          <CardHeader>
            <CardTitle>Auction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Auction Amount (Discount)
                </p>
                <p className='text-2xl font-bold'>
                  ₹{month.auctionAmount?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Winner</p>
                <p className='text-2xl font-bold'>
                  {winner?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Winner Payout</p>
                <p className='text-2xl font-bold text-green-600'>
                  ₹{winnerPayout.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Statistics */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <CardTitle>Paid</CardTitle>
            </div>
            <CardDescription className='text-2xl font-bold'>
              {paidCount}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-yellow-600' />
              <CardTitle>Partial</CardTitle>
            </div>
            <CardDescription className='text-2xl font-bold'>
              {partialCount}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-600' />
              <CardTitle>Unpaid</CardTitle>
            </div>
            <CardDescription className='text-2xl font-bold'>
              {unpaidCount}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Participant Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participant Payment Status</CardTitle>
          <CardDescription>
            Detailed breakdown of payments by each participant for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Payments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantPayments
                .sort((a, b) =>
                  a.participant.name.localeCompare(b.participant.name)
                )
                .map(
                  ({
                    participant,
                    paid,
                    expected,
                    outstanding,
                    status,
                    payments,
                  }) => (
                    <TableRow key={participant.id}>
                      <TableCell className='font-medium'>
                        {participant.name}
                      </TableCell>
                      <TableCell>₹{expected.toLocaleString("en-IN")}</TableCell>
                      <TableCell
                        className={paid < expected ? "text-destructive" : ""}>
                        ₹{paid.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {outstanding > 0 ? (
                          <span className='text-destructive font-medium'>
                            ₹{outstanding.toLocaleString("en-IN")}
                          </span>
                        ) : outstanding < 0 ? (
                          <span className='text-green-600 font-medium'>
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
                          }>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <span className='text-sm text-muted-foreground'>
                          {payments.length} payment
                          {payments.length !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
