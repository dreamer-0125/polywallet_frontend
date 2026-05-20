import { createContext, useContext, useState, ReactNode } from "react";


export const LoadingContext = createContext({
  loading: false,
  setLoading: () => null,
});

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider
      value={{ loading, setLoading }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoadingContext = () => useContext(LoadingContext);