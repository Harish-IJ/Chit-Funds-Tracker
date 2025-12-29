import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChitFund } from "@/providers/ChitFundProvider";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { Participant, ChitMonth, Payment } from "@/types/chit.types";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chitId?: string; // If provided, imports are scoped to this chit
}

export function CsvImportDialog({ open, onOpenChange, chitId }: CsvImportDialogProps) {
  const { data, addParticipant, addChitMonth, addPayment } = useChitFund();
  const [activeTab, setActiveTab] = useState<"participants" | "months" | "payments">(
    "participants"
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chit = chitId ? data.chits.find((c) => c.id === chitId) : null;
  const participants = chitId ? data.participants.filter((p) => p.chitId === chitId) : [];

  // CSV Templates - simplified without chitName column
  const TEMPLATES = {
    participants: {
      headers: ["name", "role", "status"],
      example: [
        ["John Doe", "member", "active"],
        ["Jane Smith", "owner", "active"],
        ["Bob Wilson", "member", "active"],
      ],
      description: `Import participants for ${chit?.name || "this chit"}`,
    },
    months: {
      headers: ["monthNumber", "type", "auctionAmount", "winnerName"],
      example: [
        ["1", "auction", "50000", ""],
        ["2", "auction", "45000", ""],
        ["3", "fixed", "", ""],
      ],
      description: "Import monthly auctions (set winnerName after participants exist)",
    },
    payments: {
      headers: ["participantName", "monthNumber", "amount", "date", "note"],
      example: [
        ["John Doe", "1", "25000", "2024-01-15", "First payment"],
        ["Jane Smith", "1", "25000", "2024-01-16", ""],
        ["Bob Wilson", "1", "25000", "2024-01-17", "Cash"],
      ],
      description: "Import payments (participant & month must exist)",
    },
  };

  type TemplateType = keyof typeof TEMPLATES;

  const downloadTemplate = (type: TemplateType) => {
    const template = TEMPLATES[type];
    const csvContent = [
      template.headers.join(","),
      ...template.example.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chit?.name || "chit"}_${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type} template downloaded`);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split("\n");
    return lines.map((line) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const importParticipants = (rows: string[][]): { success: number; errors: string[] } => {
    if (!chitId) return { success: 0, errors: ["No chit selected"] };

    const errors: string[] = [];
    let success = 0;

    rows.forEach((row, index) => {
      try {
        const [name, role, status] = row;

        if (!name) {
          errors.push(`Row ${index + 2}: Missing participant name`);
          return;
        }

        // Check for duplicate
        const existingParticipant = data.participants.find(
          (p) => p.chitId === chitId && p.name.toLowerCase() === name.toLowerCase()
        );
        if (existingParticipant) {
          errors.push(`Row ${index + 2}: Participant "${name}" already exists`);
          return;
        }

        const participant: Participant = {
          id: generateId("participant"),
          chitId,
          name,
          role: (role as Participant["role"]) || "member",
          status: (status as Participant["status"]) || "active",
        };

        addParticipant(participant);
        success++;
      } catch (e) {
        errors.push(`Row ${index + 2}: ${e instanceof Error ? e.message : "Invalid data"}`);
      }
    });

    return { success, errors };
  };

  const importMonths = (rows: string[][]): { success: number; errors: string[] } => {
    if (!chitId) return { success: 0, errors: ["No chit selected"] };

    const errors: string[] = [];
    let success = 0;

    rows.forEach((row, index) => {
      try {
        const [monthNumber, type, auctionAmount, winnerName] = row;

        if (!monthNumber) {
          errors.push(`Row ${index + 2}: Missing month number`);
          return;
        }

        const monthNum = parseInt(monthNumber);

        // Check for duplicate month
        const existingMonth = data.chitMonths.find(
          (m) => m.chitId === chitId && m.monthNumber === monthNum
        );
        if (existingMonth) {
          errors.push(`Row ${index + 2}: Month ${monthNum} already exists`);
          return;
        }

        // Find winner if specified
        const winner = winnerName
          ? participants.find((p) => p.name.toLowerCase() === winnerName.toLowerCase())
          : undefined;

        if (winnerName && !winner) {
          errors.push(`Row ${index + 2}: Winner "${winnerName}" not found`);
        }

        const month: ChitMonth = {
          id: generateId("month"),
          chitId,
          monthNumber: monthNum,
          type: (type as ChitMonth["type"]) || "auction",
          auctionAmount: auctionAmount ? parseFloat(auctionAmount) : undefined,
          winnerParticipantId: winner?.id,
        };

        addChitMonth(month);
        success++;
      } catch (e) {
        errors.push(`Row ${index + 2}: ${e instanceof Error ? e.message : "Invalid data"}`);
      }
    });

    return { success, errors };
  };

  const importPayments = (rows: string[][]): { success: number; errors: string[] } => {
    if (!chitId) return { success: 0, errors: ["No chit selected"] };

    const errors: string[] = [];
    let success = 0;

    rows.forEach((row, index) => {
      try {
        const [participantName, monthNumber, amount, date, note] = row;

        if (!participantName || !monthNumber || !amount) {
          errors.push(`Row ${index + 2}: Missing required fields`);
          return;
        }

        const participant = participants.find(
          (p) => p.name.toLowerCase() === participantName.toLowerCase()
        );
        if (!participant) {
          errors.push(`Row ${index + 2}: Participant "${participantName}" not found`);
          return;
        }

        const monthNum = parseInt(monthNumber);
        const monthExists = data.chitMonths.some(
          (m) => m.chitId === chitId && m.monthNumber === monthNum
        );
        if (!monthExists) {
          errors.push(`Row ${index + 2}: Month ${monthNum} doesn't exist`);
          return;
        }

        const payment: Payment = {
          id: generateId("payment"),
          chitId,
          participantId: participant.id,
          monthNumber: monthNum,
          amount: parseFloat(amount),
          date: date || new Date().toISOString().split("T")[0],
          note: note || undefined,
        };

        addPayment(payment);
        success++;
      } catch (e) {
        errors.push(`Row ${index + 2}: ${e instanceof Error ? e.message : "Invalid data"}`);
      }
    });

    return { success, errors };
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);

        // Skip header row
        const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell));

        let result: { success: number; errors: string[] };

        switch (activeTab) {
          case "participants":
            result = importParticipants(dataRows);
            break;
          case "months":
            result = importMonths(dataRows);
            break;
          case "payments":
            result = importPayments(dataRows);
            break;
          default:
            result = { success: 0, errors: ["Unknown import type"] };
        }

        setImportResult(result);
        if (result.success > 0) {
          toast.success(`Imported ${result.success} ${activeTab}`);
        }
      } catch (error) {
        setImportResult({
          success: 0,
          errors: [error instanceof Error ? error.message : "Failed to parse CSV"],
        });
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const tabIcons = {
    participants: Users,
    months: Calendar,
    payments: CreditCard,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Data for {chit?.name || "Chit"}
          </DialogTitle>
          <DialogDescription>
            Download a template, fill in your data, and import it. All imports are for this chit
            only.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateType)}>
          <TabsList className="grid grid-cols-3">
            {(Object.keys(TEMPLATES) as TemplateType[]).map((type) => {
              const Icon = tabIcons[type];
              return (
                <TabsTrigger key={type} value={type} className="capitalize text-xs">
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {type}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(TEMPLATES) as TemplateType[]).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">{TEMPLATES[type].description}</p>
                <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                  <div className="text-muted-foreground">{TEMPLATES[type].headers.join(", ")}</div>
                </div>
              </div>

              {type === "participants" && (
                <div className="text-xs text-muted-foreground">
                  <strong>Roles:</strong> member, owner | <strong>Status:</strong> active, won,
                  exited
                </div>
              )}

              {type === "months" && (
                <div className="text-xs text-muted-foreground">
                  <strong>Type:</strong> auction, fixed | <strong>Winner:</strong> Leave empty if
                  not decided
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => downloadTemplate(type)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? "Importing..." : "Import CSV"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          style={{ display: "none" }}
        />

        {/* Import Results */}
        {importResult && (
          <div className="space-y-3">
            {importResult.success > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Successfully imported {importResult.success} {activeTab}
                </AlertDescription>
              </Alert>
            )}
            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">{importResult.errors.length} error(s):</div>
                  <div className="text-xs max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div>...and {importResult.errors.length - 5} more</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
