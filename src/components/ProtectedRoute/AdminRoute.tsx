import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let isAdmin = false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded: Record<string, string | string[]> = JSON.parse(jsonPayload);
    
    let roleClaim: string | string[] | null = null;
    for (const key in decoded) {
      if (key.toLowerCase().includes("role")) {
        roleClaim = decoded[key];
        break;
      }
    }

    if (roleClaim) {
      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
      
      // الأدمن بياخد Role 2 أو "admin"
      isAdmin = normalizedRoles.includes("admin") || normalizedRoles.includes("2");
    }
  } catch (error: unknown) {
    console.error("Error decoding token in AdminRoute:", error);
    isAdmin = false;
  }

  if (isAdmin) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default AdminRoute;