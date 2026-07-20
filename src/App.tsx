import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext"; 

import HomePage from "./pages/HomePage/HomePage";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import DoctorChildren from "./pages/DoctorChildren/DoctorChildren";
import ErrorLayout from "./layouts/ErrorLayout/ErrorLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ChildProfile from "./pages/ChildProfile/ChildProfile";

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* 👇 التعديل هنا: شيلنا الـ AuthLayout من هنا لأنك أصلاً مستخدماه جوه الصفحات دي */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          <Route element={<DashboardLayout role="doctor" />}>
            <Route path="/doctor/children" element={<DoctorChildren />} />
            <Route path="/child/:id" element={<ChildProfile />} />
          </Route>
          
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;