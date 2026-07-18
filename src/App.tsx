import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
// استدعي صفحاتك التانية هنا (الـ Auth والـ Error)
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import DoctorChildren from "./pages/DoctorChildren/DoctorChildren";
import ErrorLayout from "./layouts/ErrorLayout/ErrorLayout";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ChildProfile from "./pages/ChildProfile/ChildProfile";
import AddChildModal from './components/Modals/AddChildModal/AddChildModal';

function App() {
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  useEffect(() => {
    const handleOpen = () => setIsAddChildModalOpen(true);
    
    window.addEventListener('openAddChildModal', handleOpen);
    
    return () => window.removeEventListener('openAddChildModal', handleOpen);
  }, []);

  return (
    <BrowserRouter>
      {/* 3. الراوتر الطبيعي بتاعك */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
        <Route element={<DashboardLayout role="doctor" />}>
          <Route path="/doctor/children" element={<DoctorChildren />} />
          <Route path="/child/:id" element={<ChildProfile />} />
        </Route>
        <Route path="*" element={<ErrorLayout />} />
      </Routes>

      {/* 4. عرض البوب أب فوق كل الصفحات عند الحاجة */}
      {isAddChildModalOpen && (
        <AddChildModal onClose={() => setIsAddChildModalOpen(false)} />
      )}
    </BrowserRouter>
  );
}

export default App;