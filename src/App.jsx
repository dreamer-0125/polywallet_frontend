import { BrowserRouter } from "react-router-dom";
import { LocaleProvider } from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { WalletConfigProvider } from "./context/WalletConfigContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingSpinner from "./components/shared/loadingSpinner";
import { AppRoutes } from "./app/routes";

function App() {
  return (
    <WalletConfigProvider>
      <AuthProvider>
        <LocaleProvider>
          <LoadingProvider>
          <LoadingSpinner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          </LoadingProvider>
        </LocaleProvider>
      </AuthProvider>
    </WalletConfigProvider>
  );
}

export default App;
