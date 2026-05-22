import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "wagmi";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isConnected } = useAccount();
  const { user } = useAuth();

  if (!isConnected || !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
