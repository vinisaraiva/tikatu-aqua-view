
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
import { SettingsPage } from "./pages/admin/settings/SettingsPage";

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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/indices" element={<Indices />} />
          <Route path="/about" element={<About />} />
          <Route path="/education" element={<Education />} />
          <Route path="/news" element={<AllNews />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/agenda-2030" element={<Agenda2030 />} />
          <Route path="/api-sondas" element={<ProbeApiDocumentation />} />
          
          {/* Admin Routes */}
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
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
