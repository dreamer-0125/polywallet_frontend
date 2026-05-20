import { BrowserRouter } from "react-router-dom";
import { LocaleProvider } from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingSpinner from "./components/shared/loadingSpinner";
import { AppRoutes } from "./app/routes";

function App() {
  return (
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
  );
}

export default App;
