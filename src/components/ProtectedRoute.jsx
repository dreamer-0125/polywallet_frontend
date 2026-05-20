import { Navigate, Outlet } from "react-router-dom";
import { useAccount, useChainId } from "wagmi";
import { useAuth } from "../context/AuthContext";
import { isPolygonChain } from "../utils/polygonChain";
import LoadingSpinner from "./shared/loadingSpinner";

const ProtectedRoute = () => {
  const { isConnected, status } = useAccount();
  const chainId = useChainId();
  const { user, sessionChecked } = useAuth();

  // Wait while wagmi is restoring the connection or the session is being verified
  if (status === "reconnecting" || status === "connecting" || !sessionChecked) {
    return <LoadingSpinner active />;
  }

  if (!isConnected || !user) {
    return <Navigate to="/" replace />;
  }

  if (!isPolygonChain(chainId)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
