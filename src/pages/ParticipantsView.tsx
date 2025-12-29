import { Link } from "react-router-dom";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getTotalExpectedContribution,
  getParticipantTotalPaid,
  getParticipantOutstanding,
  getParticipantPayments,
} from "@/lib/calculations";
import { format } from "date-fns";

export function ParticipantsView() {
  const { data } = useChitFund();

  // Group participants by chit
  const chitGroups = data.chits.map((chit) => ({
    chit,
    participants: data.participants.filter((p) => p.chitId === chit.id),
  }));

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Participants</h1>
        <p className='text-muted-foreground'>
          Track participant payments and outstanding amounts
        </p>
      </div>

      {chitGroups.map(({ chit, participants }) => {
        const chitMonths = data.chitMonths.filter(
          (cm) => cm.chitId === chit.id
        );
        const maxMonth = Math.max(...chitMonths.map((cm) => cm.monthNumber), 0);

        return (
          <Card key={chit.id}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>{chit.name || `Chit ${chit.id}`}</CardTitle>
                  <CardDescription>
                    ₹{chit.schemeValue.toLocaleString("en-IN")} •{" "}
                    {chit.participantsCount} participants • {chitMonths.length}/
                    {chit.durationMonths} months
                  </CardDescription>
                </div>
                <Link to={`/chit/${chit.id}`}>
                  <Badge
                    variant='outline'
                    className='cursor-pointer hover:bg-accent'>
                    View Chit
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Expected</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => {
                    const totalExpected = getTotalExpectedContribution(
                      chit.id,
                      data
                    );
                    const totalPaid = getParticipantTotalPaid(
                      participant.id,
                      data.payments
                    );
                    const outstanding = getParticipantOutstanding(
                      participant.id,
                      data,
                      maxMonth
                    );
                    const payments = getParticipantPayments(
                      participant.id,
                      data.payments
                    );

                    return (
                      <TableRow key={participant.id}>
                        <TableCell className='font-medium'>
                          {participant.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              participant.status === "active"
                                ? "default"
                                : participant.status === "won"
                                ? "secondary"
                                : "outline"
                            }>
                            {participant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='capitalize'>
                          {participant.role}
                        </TableCell>
                        <TableCell>
                          ₹{totalExpected.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          ₹{totalPaid.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {outstanding > 0 ? (
                            <span className='text-destructive font-semibold'>
                              ₹{outstanding.toLocaleString("en-IN")}
                            </span>
                          ) : outstanding < 0 ? (
                            <span className='text-green-600 font-semibold'>
                              +₹{Math.abs(outstanding).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <Badge variant='outline'>Paid up</Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Accordion
                            type='single'
                            collapsible
                            className='w-full'>
                            <AccordionItem
                              value='payments'
                              className='border-0'>
                              <AccordionTrigger className='py-0 hover:no-underline'>
                                <Badge
                                  variant='outline'
                                  className='cursor-pointer'>
                                  {payments.length} payment
                                  {payments.length !== 1 ? "s" : ""}
                                </Badge>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className='pt-4'>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className='w-20'>
                                          Month
                                        </TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Note</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {payments
                                        .sort(
                                          (a, b) =>
                                            a.monthNumber - b.monthNumber
                                        )
                                        .map((payment) => (
                                          <TableRow key={payment.id}>
                                            <TableCell>
                                              <Badge variant='outline'>
                                                {payment.monthNumber}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              ₹
                                              {payment.amount.toLocaleString(
                                                "en-IN"
                                              )}
                                            </TableCell>
                                            <TableCell className='text-sm text-muted-foreground'>
                                              {format(
                                                new Date(payment.date),
                                                "dd MMM yyyy"
                                              )}
                                            </TableCell>
                                            <TableCell className='text-sm text-muted-foreground'>
                                              {payment.note || "-"}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {participants.length === 0 && (
                <div className='text-center py-12 text-muted-foreground'>
                  No participants in this chit
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {chitGroups.length === 0 && (
        <Card>
          <CardContent className='text-center py-12 text-muted-foreground'>
            No chits found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
