
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NewsDetail from "./pages/NewsDetail";
import AllNews from "./pages/AllNews";
import Indices from "./pages/Indices";
import Education from "./pages/Education";
import Agenda2030 from "./pages/Agenda2030";
import NotFound from "./pages/NotFound";
import SiteAccess from "./pages/SiteAccess";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CitiesPage from "./pages/admin/cities/CitiesPage";
import RiversPage from "./pages/admin/rivers/RiversPage";
import PointsPage from "./pages/admin/points/PointsPage";
import ParametersPage from "./pages/admin/parameters/ParametersPage";
import VolunteersPage from "./pages/admin/volunteers/VolunteersPage";
import NewsPage from "./pages/admin/news/NewsPage";
import ReadingsPage from "./pages/admin/readings/ReadingsPage";
import ProbeApiDocumentation from "./pages/ProbeApiDocumentation";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AccessGate } from "./components/AccessGate";
import { SettingsPage } from "./pages/admin/settings/SettingsPage";
import AnalyticsPage from "./pages/admin/analytics/AnalyticsPage";
import { usePageTracking } from "./hooks/usePageTracking";

const PageTracker = () => {
  usePageTracking();
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTracker />
        <Routes>
          {/* Public access gate */}
          <Route path="/acesso" element={<SiteAccess />} />

          {/* Admin routes (own auth, not behind site access gate) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="rivers" element={<RiversPage />} />
            <Route path="points" element={<PointsPage />} />
            <Route path="parameters" element={<ParametersPage />} />
            <Route path="readings" element={<ReadingsPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* All public site routes are gated */}
          <Route path="/" element={<AccessGate><Index /></AccessGate>} />
          <Route path="/dashboard" element={<AccessGate><Dashboard /></AccessGate>} />
          <Route path="/indices" element={<AccessGate><Indices /></AccessGate>} />
          <Route path="/about" element={<AccessGate><About /></AccessGate>} />
          <Route path="/education" element={<AccessGate><Education /></AccessGate>} />
          <Route path="/news" element={<AccessGate><AllNews /></AccessGate>} />
          <Route path="/news/:id" element={<AccessGate><NewsDetail /></AccessGate>} />
          <Route path="/agenda-2030" element={<AccessGate><Agenda2030 /></AccessGate>} />
          <Route path="/api-sondas" element={<AccessGate><ProbeApiDocumentation /></AccessGate>} />

          <Route path="*" element={<AccessGate><NotFound /></AccessGate>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
