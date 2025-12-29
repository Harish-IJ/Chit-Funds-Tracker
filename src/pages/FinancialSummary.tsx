import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getChitProfit,
  getCompanyCashBalance,
  getChitCashBalance,
  getTotalOutstanding,
  getMonthShortfall,
  getCommissionAmount,
} from "@/lib/calculations";
import { TrendingUp, AlertCircle, IndianRupee, Wallet } from "lucide-react";

// Chart configurations
const profitCashChartConfig = {
  profit: {
    label: "Profit",
    color: "#10b981",
  },
  cash: {
    label: "Cash",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

const collectionChartConfig = {
  collected: {
    label: "Collected",
    color: "#10b981",
  },
  shortfall: {
    label: "Shortfall",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const outstandingChartConfig = {
  outstanding: {
    label: "Outstanding",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function FinancialSummary() {
  const { data } = useChitFund();

  const totalCashBalance = getCompanyCashBalance(data);

  const chitMetrics = data.chits.map((chit) => {
    const profit = getChitProfit(chit.id, data);
    const cashBalance = getChitCashBalance(chit.id, data);
    const outstanding = getTotalOutstanding(chit.id, data);
    const commission = getCommissionAmount(chit);

    return { chit, profit, cashBalance, outstanding, commission };
  });

  const totalProfit = chitMetrics.reduce((sum, m) => sum + m.profit, 0);
  const totalOutstanding = chitMetrics.reduce((sum, m) => sum + m.outstanding, 0);
  const totalCommission = chitMetrics.reduce((sum, m) => sum + m.commission, 0);

  const monthlyCollectionData = data.chits.flatMap((chit) => {
    return data.chitMonths
      .filter((cm) => cm.chitId === chit.id)
      .map((month) => {
        const payments = data.payments
          .filter((p) => p.chitId === chit.id && p.monthNumber === month.monthNumber)
          .reduce((sum, p) => sum + p.amount, 0);
        const shortfall = getMonthShortfall(chit.id, month.monthNumber, data);
        return {
          month: `M${month.monthNumber}`,
          collected: payments,
          shortfall: shortfall > 0 ? shortfall : 0,
        };
      });
  });

  const profitVsCashData = chitMetrics.map((m) => ({
    name: m.chit.name || m.chit.id,
    profit: m.profit,
    cash: m.cashBalance,
  }));

  const outstandingDistribution = chitMetrics
    .filter((m) => m.outstanding > 0)
    .map((m) => ({
      name: m.chit.name || m.chit.id,
      outstanding: m.outstanding,
    }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Summary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive profit, cash flow, and outstanding tracking
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{totalProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash Balance</p>
                <p
                  className={`text-lg font-semibold ${
                    totalCashBalance >= 0 ? "text-blue-600" : "text-destructive"
                  }`}
                >
                  ₹{totalCashBalance.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-lg font-semibold text-orange-600">
                  ₹{totalOutstanding.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <IndianRupee className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected Commission</p>
                <p className="text-lg font-semibold text-purple-600">
                  ₹{totalCommission.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit vs Cash Explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Profit vs Cash Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-green-500/10">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Profit (Commission)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Commission embedded in monthly collections. Represents company profit.
              </p>
              <p className="text-xl font-bold">₹{totalProfit.toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-500/10">
                  <Wallet className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Cash Balance</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Actual cash after collections, payouts, and movements.
              </p>
              <p
                className={`text-xl font-bold ${
                  totalCashBalance >= 0 ? "text-blue-600" : "text-destructive"
                }`}
              >
                ₹{totalCashBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <p className="text-muted-foreground">
              Outstanding dues of ₹{totalOutstanding.toLocaleString("en-IN")} are NOT counted as
              profit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profit vs Cash Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Profit vs Cash by Chit</CardTitle>
          </CardHeader>
          <CardContent>
            {profitVsCashData.length > 0 ? (
              <ChartContainer config={profitCashChartConfig} className="h-[280px] w-full">
                <BarChart accessibilityLayer data={profitVsCashData}>
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
                  <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                  <Bar dataKey="cash" fill="var(--color-cash)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Outstanding by Chit</CardTitle>
          </CardHeader>
          <CardContent>
            {outstandingDistribution.length > 0 ? (
              <ChartContainer config={outstandingChartConfig} className="h-[280px] w-full">
                <BarChart accessibilityLayer data={outstandingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                      />
                    }
                  />
                  <Bar dataKey="outstanding" fill="var(--color-outstanding)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No outstanding dues</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collection Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Collection Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyCollectionData.length > 0 ? (
            <ChartContainer config={collectionChartConfig} className="h-[280px] w-full">
              <LineChart accessibilityLayer data={monthlyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="var(--color-collected)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-collected)" }}
                />
                <Line
                  type="monotone"
                  dataKey="shortfall"
                  stroke="var(--color-shortfall)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-shortfall)" }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No collection data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Chit Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Breakdown by Chit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {chitMetrics.map(({ chit, profit, cashBalance, outstanding }) => (
            <div key={chit.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{chit.name || chit.id}</h3>
                <Badge
                  variant={chit.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {chit.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Profit</p>
                  <p className="font-semibold text-green-600">₹{profit.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cash</p>
                  <p
                    className={`font-semibold ${
                      cashBalance >= 0 ? "text-blue-600" : "text-destructive"
                    }`}
                  >
                    ₹{cashBalance.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Outstanding</p>
                  <p className="font-semibold text-orange-600">
                    ₹{outstanding.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Scheme Value</p>
                  <p className="font-semibold">₹{chit.schemeValue.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          ))}

          {chitMetrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No chits found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
