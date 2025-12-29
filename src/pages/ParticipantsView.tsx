import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getTotalExpectedContribution,
  getParticipantTotalPaid,
  getParticipantOutstanding,
  getParticipantPayments,
  getParticipantMonthlyDue,
} from "@/lib/calculations";
import { format } from "date-fns";
import {
  Users,
  IndianRupee,
  CheckCircle,
  TrendingUp,
  Calendar,
  Trophy,
  ChevronRight,
} from "lucide-react";
import type { Participant } from "@/types/chit.types";

export function ParticipantsView() {
  const { data } = useChitFund();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Calculate totals
  const totalParticipants = data.participants.length;
  const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);
  const activeParticipants = data.participants.filter((p) => p.status === "active").length;
  const wonParticipants = data.participants.filter((p) => p.status === "won").length;

  // Get participant details for the selected one
  const getParticipantDetails = (participant: Participant) => {
    const chit = data.chits.find((c) => c.id === participant.chitId);
    const chitMonths = data.chitMonths.filter((m) => m.chitId === participant.chitId);
    const maxMonth = Math.max(...chitMonths.map((m) => m.monthNumber), 0);
    const payments = getParticipantPayments(participant.id, data.payments);
    const totalPaid = getParticipantTotalPaid(participant.id, data.payments);
    const outstanding = getParticipantOutstanding(participant.id, data, maxMonth);
    const totalExpected = getTotalExpectedContribution(participant.chitId, data);

    // Payment timeline data
    const paymentTimeline = chitMonths
      .sort((a, b) => a.monthNumber - b.monthNumber)
      .map((month) => {
        const monthlyDue = getParticipantMonthlyDue(participant.id, month.monthNumber, data);
        const paid = payments
          .filter((p) => p.monthNumber === month.monthNumber)
          .reduce((sum, p) => sum + p.amount, 0);
        return {
          month: `M${month.monthNumber}`,
          due: monthlyDue,
          paid: paid,
          status: paid >= monthlyDue ? "paid" : paid > 0 ? "partial" : "unpaid",
        };
      });

    // Monthly payment breakdown
    const monthlyPayments = paymentTimeline.map((m) => ({
      name: m.month,
      Paid: m.paid,
      Due: m.due,
    }));

    // Has won auction
    const wonMonth = chitMonths.find((m) => m.winnerParticipantId === participant.id);

    return {
      chit,
      payments,
      totalPaid,
      outstanding,
      totalExpected,
      paymentTimeline,
      monthlyPayments,
      wonMonth,
      paidCount: paymentTimeline.filter((m) => m.status === "paid").length,
      totalMonths: chitMonths.length,
    };
  };

  // All participants with their data
  const participantsData = data.participants.map((participant) => {
    const chit = data.chits.find((c) => c.id === participant.chitId);
    const chitMonths = data.chitMonths.filter((m) => m.chitId === participant.chitId);
    const maxMonth = Math.max(...chitMonths.map((m) => m.monthNumber), 0);
    const totalPaid = getParticipantTotalPaid(participant.id, data.payments);
    const outstanding = getParticipantOutstanding(participant.id, data, maxMonth);
    const totalExpected = getTotalExpectedContribution(participant.chitId, data);
    const hasWon = chitMonths.some((m) => m.winnerParticipantId === participant.id);

    return {
      participant,
      chit,
      totalPaid,
      outstanding,
      totalExpected,
      hasWon,
      completionPercent: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track participant payments and outstanding amounts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">{activeParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Trophy className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Won</p>
                <p className="text-lg font-semibold">{wonParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collected</p>
                <p className="text-lg font-semibold">₹{totalPaid.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Participants Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">All Participants</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Chit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsData.map(
                ({ participant, chit, totalPaid, outstanding, completionPercent, hasWon }) => (
                  <TableRow
                    key={participant.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {participant.name}
                        {hasWon && <Trophy className="h-3.5 w-3.5 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/chit/${chit?.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {chit?.name || chit?.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.status === "active"
                            ? "default"
                            : participant.status === "won"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {participant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{totalPaid.toLocaleString("en-IN")}</TableCell>
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
                        <Badge variant="outline" className="text-xs">
                          Paid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(completionPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{completionPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>

          {participantsData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participant Profile Dialog */}
      <Dialog
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
      >
        <DialogContent className="lg:max-w-7xl  max-h-[90vh] overflow-y-auto">
          {selectedParticipant &&
            (() => {
              const details = getParticipantDetails(selectedParticipant);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-xl">{selectedParticipant.name}</span>
                        <p className="text-sm font-normal text-muted-foreground mt-0.5">
                          {details.chit?.name || "Unknown Chit"} • {selectedParticipant.role}
                        </p>
                      </div>
                      {details.wonMonth && (
                        <Badge className="ml-auto bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          <Trophy className="h-3 w-3 mr-1" />
                          Won Month {details.wonMonth.monthNumber}
                        </Badge>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="text-lg font-semibold">
                        ₹{details.totalPaid.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Expected</p>
                      <p className="text-lg font-semibold">
                        ₹{details.totalExpected.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                      <p
                        className={`text-lg font-semibold ${
                          details.outstanding > 0 ? "text-destructive" : "text-green-600"
                        }`}
                      >
                        {details.outstanding > 0 ? "₹" : "+₹"}
                        {Math.abs(details.outstanding).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Months Paid</p>
                      <p className="text-lg font-semibold">
                        {details.paidCount}/{details.totalMonths}
                      </p>
                    </div>
                  </div>

                  {/* Payment Timeline Chart */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Payment Timeline
                    </h4>
                    {details.monthlyPayments.length > 0 ? (
                      <ChartContainer
                        config={
                          {
                            Due: { label: "Due", color: "#94a3b8" },
                            Paid: { label: "Paid", color: "#10b981" },
                          } satisfies ChartConfig
                        }
                        className="h-[200px] w-full"
                      >
                        <BarChart accessibilityLayer data={details.monthlyPayments}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                              />
                            }
                          />
                          <Bar dataKey="Due" fill="var(--color-Due)" radius={4} />
                          <Bar dataKey="Paid" fill="var(--color-Paid)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No payment data yet</p>
                      </div>
                    )}
                  </div>

                  {/* Monthly Status */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Monthly Payment Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {details.paymentTimeline.map((m) => (
                        <div
                          key={m.month}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            m.status === "paid"
                              ? "bg-green-500/10 text-green-600"
                              : m.status === "partial"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {m.month}: ₹{m.paid.toLocaleString("en-IN")}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Payment History ({details.payments.length})
                    </h4>
                    {details.payments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Month</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Note</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {details.payments
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {payment.monthNumber}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {format(new Date(payment.date), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {payment.note || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                        <p className="text-sm">No payments recorded</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
