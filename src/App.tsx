import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext"; 

import HomePage from "./pages/HomePage/HomePage";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import DoctorChildren from "./pages/DoctorChildren/DoctorChildren";
import ErrorLayout from "./layouts/ErrorLayout/ErrorLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ChildProfile from "./pages/ChildProfile/ChildProfile";
import ConfirmEmail from "./pages/ConfirmEmail/ConfirmEmail";
import PendingVerification from "./pages/ConfirmEmail/PendingVerification";

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/pending-verification" element={<PendingVerification />} />
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