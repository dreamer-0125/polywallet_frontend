import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getNftData, nftMint } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLoadingContext } from "../context/LoadingContext";
import { hydrateUser } from "../utils/userDisplay";

export const DEFAULT_NFT_DATA = {
  nftPrice: 1000,
  mintedNfts: 0,
  nftLimited: 1000,
  remainingNfts: 1000,
  nftSeries: "Genesis",
  nftName: "Genesis Cube",
  nftEdition: 1,
  nftDescription:
    "A limited edition collectible granting holders lifetime privileges across the PolyWallet ecosystem.",
};

export function formatNftSupply(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return n.toLocaleString("en-US");
}

export function useNftCollection() {
  const { user, setUser, refreshUser } = useAuth();
  const { setLoading } = useLoadingContext();
  const [showMintModal, setShowMintModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [nftData, setNftData] = useState({});

  const displayNftData = useMemo(
    () => ({ ...DEFAULT_NFT_DATA, ...nftData }),
    [nftData],
  );

  const ownedCount = Number(user?.nftAmount ?? 0);
  const rankLabel = user?.rank || "—";
  const remainingNfts =
    displayNftData.remainingNfts ??
    Math.max(
      0,
      Number(displayNftData.nftLimited) - Number(displayNftData.mintedNfts),
    );
  const maxSupply = Number(displayNftData.nftLimited) || 0;
  const supplyLabel = formatNftSupply(maxSupply);
  const editionLabel = `#${String(displayNftData.nftEdition ?? 1).padStart(3, "0")} / ${supplyLabel}`;
  const mintProgress =
    displayNftData.nftLimited > 0
      ? Math.min(
          100,
          (displayNftData.mintedNfts / displayNftData.nftLimited) * 100,
        )
      : 0;
  const mintedDisplay = displayNftData.mintedNfts.toLocaleString("en-US");
  const limitedDisplay = displayNftData.nftLimited.toLocaleString("en-US");
  const limitedShort = formatNftSupply(displayNftData.nftLimited);
  const heroMintLabel = `${mintedDisplay} / ${limitedShort}`;

  const loadNftData = useCallback(async () => {
    try {
      const response = await getNftData();
      if (response?.nftData) {
        setNftData(response.nftData);
      }
    } catch {
      /* session errors handled globally */
    }
  }, []);

  const init = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    await loadNftData();
    setLoading(false);
  }, [user?.id, setLoading, loadNftData]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(loadNftData, 30_000);
    return () => clearInterval(id);
  }, [user?.id, loadNftData]);

  const handleNftMint = async () => {
    const numericQuantity = Number(quantity);
    const amount = displayNftData.nftPrice * numericQuantity;
    if (amount > Number(user?.polyBalance ?? 0)) {
      toast.info("Your Balance is insufficient!");
      return;
    }
    const ownedBefore = Number(user?.nftAmount ?? 0);
    setLoading(true);
    try {
      const response = await nftMint(numericQuantity);
      if (response?.success) {
        if (response.user) {
          setUser((prev) =>
            prev
              ? { ...prev, ...hydrateUser(response.user) }
              : hydrateUser(response.user),
          );
        }
        if (response.nftData) {
          setNftData(response.nftData);
        } else {
          await loadNftData();
        }
        await refreshUser();
        toast.success(
          response.postCommitWarning
            ? "NFT minted. " + response.postCommitWarning
            : "NFT minted successfully!",
        );
      } else {
        toast.info(response?.message || "Please try again later!");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 500) {
        await loadNftData();
        const refreshed = await refreshUser();
        const ownedAfter = Number(refreshed?.nftAmount ?? 0);
        if (ownedAfter > ownedBefore) {
          toast.success(
            "NFT mint completed on the server. Balances have been refreshed.",
          );
          setShowMintModal(false);
          setLoading(false);
          return;
        }
      }
      const msg = err?.response?.data?.message || err?.message || "Mint failed";
      toast.error(msg);
    } finally {
      setShowMintModal(false);
      setLoading(false);
    }
  };

  return {
    user,
    showMintModal,
    setShowMintModal,
    quantity,
    setQuantity,
    displayNftData,
    ownedCount,
    rankLabel,
    supplyLabel,
    maxSupply,
    editionLabel,
    mintProgress,
    mintedDisplay,
    limitedDisplay,
    heroMintLabel,
    remainingNfts,
    handleNftMint,
    loadNftData,
  };
}
