import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./providers/theme-provider";
import { ChitFundProvider } from "./providers/ChitFundProvider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Toaster } from "sonner";
import { AppSidebar } from "./components/app-sidebar";
import { Separator } from "./components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";

// Pages
import { ChitsList } from "./pages/ChitsList";
import { ChitDetail } from "./pages/ChitDetail";
import { MonthDetail } from "./pages/MonthDetail";
import { ParticipantsView } from "./pages/ParticipantsView";
import { FinancialSummary } from "./pages/FinancialSummary";

function Navigation() {
  const location = useLocation();

  // Determine current page title based on route
  const getPageTitle = () => {
    if (location.pathname === "/") return "Chits Overview";
    if (location.pathname === "/participants") return "Participants";
    if (location.pathname === "/financial") return "Financial Summary";
    if (location.pathname.includes("/month/")) return "Month Details";
    if (location.pathname.includes("/chit/")) return "Chit Details";
    return "Dashboard";
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/">Chit Fund Manager</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ChitFundProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Navigation />
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Routes>
                  <Route path="/" element={<ChitsList />} />
                  <Route path="/chit/:chitId" element={<ChitDetail />} />
                  <Route path="/chit/:chitId/month/:monthNumber" element={<MonthDetail />} />
                  <Route path="/participants" element={<ParticipantsView />} />
                  <Route path="/financial" element={<FinancialSummary />} />
                </Routes>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ChitFundProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}

export default App;
