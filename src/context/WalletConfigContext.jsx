import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { fetchWalletConfig } from "../api";

const defaultRankEntry = { bonusRate: 0, bonusLevel: 0, pointApy: 0 };

const WalletConfigContext = createContext({
  loaded: false,
  balanceInterestApy: 0.1,
  maxPointApy: 0.6,
  rankData: {},
  rankCondition: [],
  getRankStats: () => defaultRankEntry,
});

export function formatRatePercent(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return "0%";
  const pct = n * 100;
  return `${pct % 1 === 0 ? pct : pct.toFixed(1)}%`;
}

export const WalletConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    balanceInterestApy: 0.1,
    maxPointApy: 0.6,
    rankData: {},
    rankCondition: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchWalletConfig();
        if (!cancelled && data) {
          setConfig({
            balanceInterestApy: data.balanceInterestApy ?? 0.1,
            maxPointApy: data.maxPointApy ?? 0.6,
            rankData: data.rankData ?? {},
            rankCondition: data.rankCondition ?? [],
          });
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getRankStats = useMemo(
    () => (rank) => config.rankData[rank ?? ""] ?? defaultRankEntry,
    [config.rankData]
  );

  const value = useMemo(
    () => ({
      loaded,
      balanceInterestApy: config.balanceInterestApy,
      maxPointApy: config.maxPointApy,
      rankData: config.rankData,
      rankCondition: config.rankCondition,
      getRankStats,
    }),
    [loaded, config, getRankStats]
  );

  return (
    <WalletConfigContext.Provider value={value}>
      {children}
    </WalletConfigContext.Provider>
  );
};

export const useWalletConfig = () => useContext(WalletConfigContext);
