import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./shared/loadingSpinner";

/**
 * JWT session (`user`) is the gate for app routes.
 * Wallet may disconnect temporarily on mobile (WalletConnect background) without logging the user out.
 */
const ProtectedRoute = () => {
  const { user, sessionChecked } = useAuth();

  if (!sessionChecked) {
    return <LoadingSpinner active />;
  }

  if (!user?.id) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
