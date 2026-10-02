import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PatientListPage from "./pages/PatientListPage";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import DocumentListPage from "./pages/DocumentListPage";
import PatientDocumentsPage from "./pages/PatientDocumentsPage";
import PatientAccessPage from "./pages/PatientAccessPage";
import UserManagementPage from "./pages/UserManagementPage";
import AdminPatientManagementPage from "./pages/AdminPatientManagementPage";
import AuditLogPage from "./pages/AuditLogPage";
import MonitoringPage from "./pages/MonitoringPage";
import SecurityPage from "./pages/SecurityPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import CreateUserPage from "./pages/CreateUserPage";

const queryClient = new QueryClient();

const LoginRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const PublicHome = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Chargement">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Index />;
};

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginRedirect />} />
                <Route path="/cr" element={<CreateUserPage />} />
                <Route path="/patient-access" element={<PatientAccessPage />} />
                <Route path="/" element={<PublicHome />} />

                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/patients" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><PatientListPage /></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute allowedRoles={['doctor']}><UploadDocumentPage /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><DocumentListPage /></ProtectedRoute>} />
                  <Route path="/my-documents" element={<ProtectedRoute allowedRoles={['patient']}><PatientDocumentsPage /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
                  <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatientManagementPage /></ProtectedRoute>} />
                  <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogPage /></ProtectedRoute>} />
                  <Route path="/admin/monitoring" element={<ProtectedRoute allowedRoles={['admin']}><MonitoringPage /></ProtectedRoute>} />
                  <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['admin']}><SecurityPage /></ProtectedRoute>} />
                

                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
