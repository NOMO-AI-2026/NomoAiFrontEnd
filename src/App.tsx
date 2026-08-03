import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext"; 
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage/HomePage";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import DoctorChildren from "./pages/DoctorChildren/DoctorChildren";
import ErrorLayout from "./layouts/ErrorLayout/ErrorLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ChildProfile from "./pages/ChildProfile/ChildProfile";

import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import PendingApproval from "./pages/PendingApproval/PendingApproval"; 
import VerifyOTP from "./pages/VerifyOTP/VerifyOTP";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import ParentChildren from "./pages/ParentChildren/ParentChildren";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import AdminRoute from "./components/ProtectedRoute/AdminRoute";
import AdminOverview from "./pages/Admin/Overview/AdminOverview";
import AdminDoctors from "./pages/Admin/Doctors/AdminDoctors";
import AdminParents from "./pages/Admin/Parents/AdminParents";
import SessionScreen from "./pages/SessionScreen/SessionScreen";
import SupportTickets from "./pages/Admin/Support/SupportTickets";

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/pending-approval" element={<PendingApproval />} /> 
          
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* مسارات لوحة التحكم الموحدة (أطباء / أولياء أمور / أدمن) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/child/:id" element={<ChildProfile />} />
              
              {/* مسارات الطبيب */}
              <Route path="/doctor/children" element={<DoctorChildren />} />

              {/* مسارات ولي الأمر */}
              <Route path="/parent/children" element={<ParentChildren />} />
              <Route path="/session" element={<SessionScreen />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/doctors" element={<AdminDoctors />} />
                <Route path="/admin/parents" element={<AdminParents />} />
                <Route path="/admin/tickets" element={<SupportTickets />} />
              </Route>
            </Route>
          </Route>
          
          {/* صفحة الخطأ 404 */}
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;