import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/shared/loadingSpinner";

const Landing = lazy(() => import("../pages/Landing"));
const Register = lazy(() => import("../pages/Register"));
const WalletA = lazy(() => import("../components/variant-a/WalletA"));
const NFTA = lazy(() => import("../components/variant-a/NFTA"));
const PointA = lazy(() => import("../components/variant-a/PointA"));
const RankA = lazy(() => import("../components/variant-a/RankA"));
const WalletB = lazy(() => import("../components/variant-b/WalletB"));
const NFTB = lazy(() => import("../components/variant-b/NFTB"));
const PointB = lazy(() => import("../components/variant-b/PointB"));
const RankB = lazy(() => import("../components/variant-b/RankB"));
const WalletADesktop = lazy(() => import("../components/desktop/WalletADesktop"));
const NFTADesktop = lazy(() => import("../components/desktop/NFTADesktop"));
const PointADesktop = lazy(() => import("../components/desktop/PointADesktop"));
const RankADesktop = lazy(() => import("../components/desktop/RankADesktop"));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner active />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/soft-white" element={<WalletA />} />
          <Route path="/soft-white/wallet" element={<WalletA />} />
          <Route path="/soft-white/nft" element={<NFTA />} />
          <Route path="/soft-white/point" element={<PointA />} />
          <Route path="/soft-white/rank" element={<RankA />} />

          <Route path="/neumorph" element={<WalletB />} />
          <Route path="/neumorph/wallet" element={<WalletB />} />
          <Route path="/neumorph/nft" element={<NFTB />} />
          <Route path="/neumorph/point" element={<PointB />} />
          <Route path="/neumorph/rank" element={<RankB />} />

          <Route path="/desktop" element={<WalletADesktop />} />
          <Route path="/desktop/wallet" element={<WalletADesktop />} />
          <Route path="/desktop/nft" element={<NFTADesktop />} />
          <Route path="/desktop/point" element={<PointADesktop />} />
          <Route path="/desktop/rank" element={<RankADesktop />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
