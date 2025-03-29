import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CreateVideo from "@/pages/create-video";
import MyContent from "@/pages/my-content";
import Publish from "@/pages/publish";
import Analytics from "@/pages/analytics";
import SeoOptimizer from "@/pages/seo-optimizer";
import CreateCaption from "@/pages/create-caption";
import Settings from "@/pages/settings";
import Templates from "@/pages/templates";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/create-video" component={CreateVideo} />
      <ProtectedRoute path="/my-content" component={MyContent} />
      <ProtectedRoute path="/publish" component={Publish} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/seo-optimizer" component={SeoOptimizer} />
      <ProtectedRoute path="/create-caption" component={CreateCaption} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/templates" component={Templates} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
