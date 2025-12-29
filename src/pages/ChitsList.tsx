import { useState } from "react";
import { useChitFund } from "@/providers/ChitFundProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getCommissionAmount } from "@/lib/calculations";
import { AddChitDialog } from "@/components/dialogs/AddChitDialog";
import { Plus } from "lucide-react";

export function ChitsList() {
  const { data } = useChitFund();
  const [addChitOpen, setAddChitOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chit Funds</h1>
          <p className="text-muted-foreground">Manage and track all chit funds</p>
        </div>
        <Button onClick={() => setAddChitOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Chit
        </Button>
      </div>

      <AddChitDialog open={addChitOpen} onOpenChange={setAddChitOpen} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.chits.map((chit) => {
          const participants = data.participants.filter((p) => p.chitId === chit.id);
          const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chit.id);
          const commission = getCommissionAmount(chit);

          return (
            <Link key={chit.id} to={`/chit/${chit.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{chit.name || `Chit ${chit.id}`}</CardTitle>
                      <CardDescription>
                        Scheme Value: ₹{chit.schemeValue.toLocaleString("en-IN")}
                      </CardDescription>
                    </div>
                    <Badge variant={chit.status === "active" ? "default" : "secondary"}>
                      {chit.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">
                        {participants.length} / {chit.participantsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{chit.durationMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="font-medium">
                        ₹{commission.toLocaleString("en-IN")} ({chit.commissionPercent * 100}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {chitMonths.length} / {chit.durationMonths} months
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
