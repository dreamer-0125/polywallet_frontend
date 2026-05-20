import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WagmiProvider } from "wagmi";
import { config } from "./config/index.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, Slide } from "react-toastify";

const query = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={query}>
        <App />
        <ToastContainer
          position="top-center"
          hideProgressBar={true}
          transition={Slide}
          autoClose={1200}
          theme="colored"
          closeButton={false}
        />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
