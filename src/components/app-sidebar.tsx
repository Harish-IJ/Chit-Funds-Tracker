import * as React from "react";
import {
  Home,
  Users,
  TrendingUp,
  Wallet,
  CalendarDays,
  Settings,
  Moon,
  Sun,
  Download,
  Upload,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useChitFund } from "@/providers/ChitFundProvider";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { CsvImportDialog } from "./dialogs/CsvImportDialog";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { data, exportData, importData } = useChitFund();
  const { theme, setTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [csvImportOpen, setCsvImportOpen] = React.useState(false);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        importData(jsonData);
        // Show success toast using sonner
        import("sonner").then(({ toast }) => toast.success("Data imported successfully!"));
      } catch {
        import("sonner").then(({ toast }) =>
          toast.error("Failed to import data. Invalid JSON file.")
        );
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mainItems = [
    {
      title: "Chits Overview",
      url: "/",
      icon: Home,
    },
    {
      title: "Participants",
      url: "/participants",
      icon: Users,
    },
    {
      title: "Financial Summary",
      url: "/financial",
      icon: TrendingUp,
    },
  ];

  const chitItems = data.chits.map((chit) => {
    const chitMonths = data.chitMonths.filter((cm) => cm.chitId === chit.id);
    return {
      id: chit.id,
      title: chit.name || `Chit ${chit.id}`,
      url: `/chit/${chit.id}`,
      icon: Wallet,
      progress: `${chitMonths.length}/${chit.durationMonths}`,
      status: chit.status,
      months: chitMonths.slice(0, 5).map((m) => ({
        number: m.monthNumber,
        type: m.type,
        url: `/chit/${chit.id}/month/${m.monthNumber}`,
      })),
    };
  });

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <CalendarDays className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Chit Fund Manager</span>
                  <span className="truncate text-xs">Tracking & Analytics</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Active Chits */}
        {chitItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Active Chits</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chitItems.map((item) => (
                  <Collapsible
                    key={item.id}
                    asChild
                    defaultOpen={location.pathname.includes(item.url)}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.months.length > 0 && (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent">
                              <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              <span className="text-xs text-muted-foreground">{item.progress}</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.months.map((month) => (
                                <SidebarMenuSubItem key={month.number}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === month.url}
                                  >
                                    <Link to={month.url}>
                                      <span>Month {month.number}</span>
                                      <span
                                        className={cn(
                                          "ml-auto text-xs",
                                          month.type === "auction"
                                            ? "text-blue-500"
                                            : "text-purple-500"
                                        )}
                                      >
                                        {month.type}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={exportData} tooltip="Export data to JSON file">
              <Download />
              <span>Export Data</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => fileInputRef.current?.click()}
              tooltip="Import data from JSON file"
            >
              <Upload />
              <span>Import Data</span>
            </SidebarMenuButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <CsvImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} />
    </Sidebar>
  );
}
