import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportWidget } from "@/components/support-widget";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/components/dashboard";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for authentication state
    return localStorage.getItem('buildwise_authenticated') === 'true';
  });
  
  useEffect(() => {
    // Save authentication state to localStorage
    localStorage.setItem('buildwise_authenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };
  
  return (
    <Switch>
      <Route path="/" exact>
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <Home onAuthenticated={handleAuthentication} />
        )}
      </Route>
      <Route path="/dashboard">
        <Dashboard />
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
