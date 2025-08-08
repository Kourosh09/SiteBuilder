import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportWidget } from "@/components/support-widget";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/components/dashboard";

// Global authentication state
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return { isAuthenticated, setIsAuthenticated };
};

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <Home onAuthenticated={() => setIsAuthenticated(true)} />
        )}
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
