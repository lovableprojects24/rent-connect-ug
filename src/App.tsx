import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import DashboardPage from "@/pages/DashboardPage";
import PropertiesPage from "@/pages/PropertiesPage";
import TenantsPage from "@/pages/TenantsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import ReportsPage from "@/pages/ReportsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import TenantDetailPage from "@/pages/TenantDetailPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import StaffPage from "@/pages/StaffPage";
import TenantPortalPage from "@/pages/TenantPortalPage";
import SettingsPage from "@/pages/SettingsPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import InstallPage from "@/pages/InstallPage";
import OnboardingPage from "@/pages/OnboardingPage";
import OnboardingRequestsPage from "@/pages/OnboardingRequestsPage";
import FindPropertyPage from "@/pages/FindPropertyPage";
import MyApplicationsPage from "@/pages/MyApplicationsPage";
import RentalApplicationsPage from "@/pages/RentalApplicationsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/requests" element={<OnboardingRequestsPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/tenants/:id" element={<TenantDetailPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/portal" element={<TenantPortalPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/find-property" element={<FindPropertyPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/rental-applications" element={<RentalApplicationsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
