import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import WalletA from "./components/variant-a/WalletA";
import NFTA from "./components/variant-a/NFTA";
import PointA from "./components/variant-a/PointA";
import RankA from "./components/variant-a/RankA";
import WalletB from "./components/variant-b/WalletB";
import NFTB from "./components/variant-b/NFTB";
import PointB from "./components/variant-b/PointB";
import RankB from "./components/variant-b/RankB";
import WalletADesktop from "./components/desktop/WalletADesktop";
import NFTADesktop from "./components/desktop/NFTADesktop";
import PointADesktop from "./components/desktop/PointADesktop";
import RankADesktop from "./components/desktop/RankADesktop";
import { LocaleProvider } from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingSpinner from "./components/shared/loadingSpinner";
import ProtectedRoute from "./components/protected_routes";

function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <LoadingProvider>
          <LoadingSpinner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                {/* Variant A: Ultra-Soft White */}
                <Route path="/soft-white" element={<WalletA />} />
                <Route path="/soft-white/wallet" element={<WalletA />} />
                <Route path="/soft-white/nft" element={<NFTA />} />
                <Route path="/soft-white/point" element={<PointA />} />
                <Route path="/soft-white/rank" element={<RankA />} />

                {/* Variant B: Neumorphism */}
                <Route path="/neumorph" element={<WalletB />} />
                <Route path="/neumorph/wallet" element={<WalletB />} />
                <Route path="/neumorph/nft" element={<NFTB />} />
                <Route path="/neumorph/point" element={<PointB />} />
                <Route path="/neumorph/rank" element={<RankB />} />

                {/* Desktop dashboards (Variant A) */}
                <Route path="/desktop" element={<WalletADesktop />} />
                <Route path="/desktop/wallet" element={<WalletADesktop />} />
                <Route path="/desktop/nft" element={<NFTADesktop />} />
                <Route path="/desktop/point" element={<PointADesktop />} />
                <Route path="/desktop/rank" element={<RankADesktop />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}

export default App;
