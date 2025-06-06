/**
 * App Root Component
 * Main entry point that sets up the application's routing,
 * global context providers, and authentication structure.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { CustomersProvider } from "./contexts/CustomersContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { SalesProvider } from "./contexts/SalesContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Companies from "./pages/Companies";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Godowns from "./pages/Godowns";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TallySync from "./pages/TallySync";
import NewSale from "./pages/NewSale";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
            <InventoryProvider>
              <SalesProvider>
                <CustomersProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/godowns" element={<Godowns />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/sales/new" element={<NewSale />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tally-sync" element={<TallySync />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </CustomersProvider>
              </SalesProvider>
            </InventoryProvider>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
