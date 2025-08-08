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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check localStorage for authentication state on initial load
    const savedAuth = localStorage.getItem('buildwise_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Save authentication state to localStorage when it changes
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
