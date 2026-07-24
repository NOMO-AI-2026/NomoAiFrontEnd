import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    let roleClaim: string | string[] | null = null;
    for (const key in decoded) {
      if (key.toLowerCase().includes("role")) {
        roleClaim = decoded[key];
        break;
      }
    }

    if (roleClaim) {
      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      const normalizedRoles = roles.map(r => String(r).toLowerCase().trim());
      
      // الأدمن بياخد Role 2
      const isAdmin = normalizedRoles.includes("admin") || normalizedRoles.includes("2");
      
      if (isAdmin) {
        return <Outlet />;
      }
    }
    
    // لو اليوزر مسجل دخول بس مش أدمن، نرجعه للصفحة الرئيسية أو الداشبورد بتاعته
    return <Navigate to="/" replace />;
    
  } catch (error) {
    console.error("Error decoding token in AdminRoute:", error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;