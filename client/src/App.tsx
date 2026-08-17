import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import Home from "@/pages/Home";
import Notes from "@/pages/Notes";
import NotFound from "@/pages/NotFound";
import StationDetail from "@/pages/StationDetail";
import Stations from "@/pages/Stations";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteLayout from "./components/SiteLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <SiteLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/duraklar" component={Stations} />
        <Route path="/duraklar/:stationNo" component={StationDetail} />
        <Route path="/notlarim" component={Notes} />
        <Route path="/hakkinda" component={About} />
        <Route path="/yonetim" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider delayDuration={200}>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
