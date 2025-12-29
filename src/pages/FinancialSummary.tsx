import { useChitFund } from "@/providers/ChitFundProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getChitProfit,
  getCompanyCashBalance,
  getChitCashBalance,
  getTotalOutstanding,
  getMonthShortfall,
  getCommissionAmount,
} from "@/lib/calculations";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export function FinancialSummary() {
  const { data } = useChitFund();

  // Calculate overall metrics
  const totalCashBalance = getCompanyCashBalance(data);

  // Per-chit metrics
  const chitMetrics = data.chits.map((chit) => {
    const profit = getChitProfit(chit.id, data);
    const cashBalance = getChitCashBalance(chit.id, data);
    const outstanding = getTotalOutstanding(chit.id, data);
    const commission = getCommissionAmount(chit);

    return {
      chit,
      profit,
      cashBalance,
      outstanding,
      commission,
    };
  });

  const totalProfit = chitMetrics.reduce((sum, m) => sum + m.profit, 0);
  const totalOutstanding = chitMetrics.reduce(
    (sum, m) => sum + m.outstanding,
    0
  );
  const totalCommission = chitMetrics.reduce((sum, m) => sum + m.commission, 0);

  // Monthly collection trend
  const monthlyCollectionData = data.chits.flatMap((chit) => {
    return data.chitMonths
      .filter((cm) => cm.chitId === chit.id)
      .map((month) => {
        const payments = data.payments
          .filter(
            (p) => p.chitId === chit.id && p.monthNumber === month.monthNumber
          )
          .reduce((sum, p) => sum + p.amount, 0);

        const shortfall = getMonthShortfall(chit.id, month.monthNumber, data);

        return {
          month: `${chit.name || chit.id}-M${month.monthNumber}`,
          collected: payments,
          shortfall: shortfall > 0 ? shortfall : 0,
        };
      });
  });

  // Profit vs Cash comparison
  const profitVsCashData = chitMetrics.map((m) => ({
    name: m.chit.name || m.chit.id,
    profit: m.profit,
    cash: m.cashBalance,
    outstanding: m.outstanding,
  }));

  // Outstanding distribution
  const outstandingDistribution = chitMetrics
    .filter((m) => m.outstanding > 0)
    .map((m) => ({
      name: m.chit.name || m.chit.id,
      value: m.outstanding,
    }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Financial Summary</h1>
        <p className='text-muted-foreground'>
          Comprehensive profit, cash flow, and outstanding tracking
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-green-600' />
              <CardDescription>Total Profit (Commission)</CardDescription>
            </div>
            <CardTitle className='text-3xl text-green-600'>
              ₹{totalProfit.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              <CardDescription>Cash Balance</CardDescription>
            </div>
            <CardTitle
              className={`text-3xl ${
                totalCashBalance >= 0 ? "text-blue-600" : "text-destructive"
              }`}>
              ₹{totalCashBalance.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-orange-600' />
              <CardDescription>Total Outstanding</CardDescription>
            </div>
            <CardTitle className='text-3xl text-orange-600'>
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <TrendingDown className='h-5 w-5 text-purple-600' />
              <CardDescription>Expected Commission</CardDescription>
            </div>
            <CardTitle className='text-3xl text-purple-600'>
              ₹{totalCommission.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Profit vs Cash Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profit vs Cash Flow Separation</CardTitle>
          <CardDescription>
            Critical distinction: Profit = Commission collected | Cash = Actual
            money in/out
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-green-600'>
                💰 Profit (Commission)
              </h3>
              <p className='text-sm text-muted-foreground'>
                Commission is embedded in monthly collections. This represents
                the company's profit from managing the chit fund.
              </p>
              <p className='text-2xl font-bold'>
                ₹{totalProfit.toLocaleString("en-IN")}
              </p>
              <p className='text-xs text-muted-foreground'>
                Expected Total: ₹{totalCommission.toLocaleString("en-IN")}
              </p>
            </div>

            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-blue-600'>
                💵 Cash Balance
              </h3>
              <p className='text-sm text-muted-foreground'>
                Actual cash in hand after all collections, payouts, and cash
                movements.
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalCashBalance >= 0 ? "text-blue-600" : "text-destructive"
                }`}>
                ₹{totalCashBalance.toLocaleString("en-IN")}
              </p>
              {totalCashBalance < 0 && (
                <p className='text-xs text-destructive'>
                  ⚠️ Negative cash balance - company owes money
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h4 className='font-semibold'>⚠️ Outstanding Dues - NOT Profit</h4>
            <p className='text-sm text-muted-foreground'>
              Outstanding dues of ₹{totalOutstanding.toLocaleString("en-IN")}{" "}
              are NOT counted as profit. They represent money owed but not yet
              received.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Profit vs Cash Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Profit vs Cash by Chit</CardTitle>
            <CardDescription>
              Compare profit and cash balance for each chit fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={profitVsCashData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `₹${value.toLocaleString("en-IN")}`
                  }
                />
                <Legend />
                <Bar dataKey='profit' fill='#10b981' name='Profit' />
                <Bar dataKey='cash' fill='#3b82f6' name='Cash' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outstanding Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Distribution</CardTitle>
            <CardDescription>
              Breakdown of outstanding dues by chit fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            {outstandingDistribution.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={outstandingDistribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={(entry) =>
                      `${entry.name}: ₹${entry.value.toLocaleString("en-IN")}`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'>
                    {outstandingDistribution.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='text-center py-12 text-muted-foreground'>
                No outstanding dues
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Collection Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Trend</CardTitle>
          <CardDescription>
            Track collections and shortfalls month by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyCollectionData.length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={monthlyCollectionData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `₹${value.toLocaleString("en-IN")}`
                  }
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='collected'
                  stroke='#10b981'
                  strokeWidth={2}
                  name='Collected'
                />
                <Line
                  type='monotone'
                  dataKey='shortfall'
                  stroke='#ef4444'
                  strokeWidth={2}
                  name='Shortfall'
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className='text-center py-12 text-muted-foreground'>
              No monthly data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Chit Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Chit Breakdown</CardTitle>
          <CardDescription>Detailed metrics for each chit fund</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {chitMetrics.map(
              ({ chit, profit, cashBalance, outstanding, commission }) => (
                <div key={chit.id} className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>
                      {chit.name || chit.id}
                    </h3>
                    <Badge
                      variant={
                        chit.status === "active" ? "default" : "secondary"
                      }>
                      {chit.status}
                    </Badge>
                  </div>
                  <div className='grid gap-4 md:grid-cols-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Profit (Collected)
                      </p>
                      <p className='text-xl font-bold text-green-600'>
                        ₹{profit.toLocaleString("en-IN")}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        of ₹{commission.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Cash Balance
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          cashBalance >= 0
                            ? "text-blue-600"
                            : "text-destructive"
                        }`}>
                        ₹{cashBalance.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Outstanding
                      </p>
                      <p className='text-xl font-bold text-orange-600'>
                        ₹{outstanding.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Scheme Value
                      </p>
                      <p className='text-xl font-bold'>
                        ₹{chit.schemeValue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
