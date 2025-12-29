import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import FirstTimeSetupPage from "./pages/auth/FirstTimeSetupPage";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyClassroomPage from "./pages/teacher/MyClassroomPage";
import StudentProfilePage from "./pages/teacher/StudentProfilePage";
import ActivityLogsPage from "./pages/teacher/ActivityLogsPage";
import MealTrackingPage from "./pages/teacher/MealTrackingPage";
import WellbeingReportsPage from "./pages/teacher/WellbeingReportsPage";

// Parent Pages
import ParentDashboard from "./pages/parent/ParentDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";

// Shared Pages
import AnnouncementsPage from "./pages/shared/AnnouncementsPage";
import MessagesPage from "./pages/shared/MessagesPage";
import DocumentsPage from "./pages/shared/DocumentsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${role}`} /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/setup" element={<FirstTimeSetupPage />} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/classroom" element={<ProtectedRoute allowedRoles={['teacher']}><MyClassroomPage /></ProtectedRoute>} />
      <Route path="/teacher/students/:studentId" element={<ProtectedRoute allowedRoles={['teacher']}><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/teacher/activity-logs" element={<ProtectedRoute allowedRoles={['teacher']}><ActivityLogsPage /></ProtectedRoute>} />
      <Route path="/teacher/meals" element={<ProtectedRoute allowedRoles={['teacher']}><MealTrackingPage /></ProtectedRoute>} />
      <Route path="/teacher/wellbeing" element={<ProtectedRoute allowedRoles={['teacher']}><WellbeingReportsPage /></ProtectedRoute>} />
      <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={['teacher']}><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={['teacher']}><MessagesPage /></ProtectedRoute>} />
      <Route path="/teacher/documents" element={<ProtectedRoute allowedRoles={['teacher']}><DocumentsPage /></ProtectedRoute>} />

      {/* Parent Routes */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/parent/activities" element={<ProtectedRoute allowedRoles={['parent']}><ActivityLogsPage /></ProtectedRoute>} />
      <Route path="/parent/meals" element={<ProtectedRoute allowedRoles={['parent']}><MealTrackingPage /></ProtectedRoute>} />
      <Route path="/parent/wellbeing" element={<ProtectedRoute allowedRoles={['parent']}><WellbeingReportsPage /></ProtectedRoute>} />
      <Route path="/parent/documents" element={<ProtectedRoute allowedRoles={['parent']}><DocumentsPage /></ProtectedRoute>} />
      <Route path="/parent/messages" element={<ProtectedRoute allowedRoles={['parent']}><MessagesPage /></ProtectedRoute>} />
      <Route path="/parent/announcements" element={<ProtectedRoute allowedRoles={['parent']}><AnnouncementsPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/admin/classrooms" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/parents" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
