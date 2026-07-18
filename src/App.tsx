import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
// استدعي صفحاتك التانية هنا (الـ Auth والـ Error)
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import DoctorChildren from "./pages/DoctorChildren/DoctorChildren";
import ErrorLayout from "./layouts/ErrorLayout/ErrorLayout";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
        <Route element={<DashboardLayout role="doctor" />}>
          <Route path="/doctor/children" element={<DoctorChildren />} />
        </Route>
        <Route path="*" element={<ErrorLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;