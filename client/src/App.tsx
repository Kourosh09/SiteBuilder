import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportWidget } from "@/components/support-widget";
// import { PropertySessionProvider } from "@/hooks/usePropertySession";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/components/dashboard";
import ContractorApplications from "@/pages/ContractorApplications";

function Router() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleAuthentication = () => {
    setIsAuthenticated(true);
    // Redirect to dashboard after successful login
    setLocation('/dashboard');
  };
  
  return (
    <Switch>
      <Route path="/">
        <Home onAuthenticated={handleAuthentication} />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/contractor-applications">
        <ContractorApplications />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <SupportWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
