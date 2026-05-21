import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import LayoutADesktop from "./LayoutADesktop";
import HeaderActionsA from "../variant-a/HeaderActionsA";
import { useLocale } from "../../i18n";
import {
  Send,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Clock,
} from "lucide-react";
import { useLoadingContext } from "../../context/LoadingContext";
import { useAuth } from "../../context/AuthContext";
import { hydrateUser } from "../../utils/userDisplay";
import { formatRatePercent } from "../../context/WalletConfigContext";
import { format } from "date-fns";
import { lookupRecipientByPolyWalletId, sendBalance, withdraw } from "../../api";
import {
  submitDepositWithRetry,
  syncPendingDepositIfAny,
  loadPendingDeposit,
} from "../../utils/depositFlow.js";
import { toast } from "react-toastify";
import { POLYGON_USDC } from "../../config";
import { ensurePolygonChain } from "../../utils/polygonChain";
import {
  getDepositTransferErrorMessage,
  sendUsdcDeposit,
} from "../../utils/usdcDeposit";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export default function WalletADesktop() {
  const navigate = useNavigate();
  const { t } = useLocale();

  const { setLoading } = useLoadingContext();
  const { user, setUser, refreshUser } = useAuth();

  const applyDepositSuccess = async (response) => {
    if (response?.user) {
      const hydrated = hydrateUser(response.user);
      setUser((prev) => (prev ? { ...prev, ...hydrated } : hydrated));
    }
    await refreshUser();
  };

  useEffect(() => {
    if (!user?.id) return;
    refreshUser();
  }, [user?.id, refreshUser]);
  const { address } = useAccount();
  const { data: rawUsdcBalance } = useReadContract({
    address: POLYGON_USDC,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  });
  const walletUsdcBalance = rawUsdcBalance != null ? Number(rawUsdcBalance) / 1e6 : 0;
  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isMatch, setIsMatch] = useState(true);
  const [walletID, setWalletID] = useState("");
  const recipientLookupTimer = useRef(null);
  const interestApyLabel = formatRatePercent(user?.rates?.balanceInterestApy);
  const [pendingDeposit, setPendingDeposit] = useState(null);

  useEffect(() => {
    setPendingDeposit(loadPendingDeposit());
  }, [activeModal]);

  useEffect(() => {
    if (!user?.id) return;
    const pending = loadPendingDeposit();
    if (!pending?.txHash) return;
    (async () => {
      const result = await syncPendingDepositIfAny();
      if (result?.ok) {
        toast.success("Pending deposit credited to your balance");
        await applyDepositSuccess(result.response);
        setPendingDeposit(null);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 768) {
        navigate("/soft-white/wallet", { replace: true });
      }
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (recipientLookupTimer.current) clearTimeout(recipientLookupTimer.current);
    };
  }, []);

  const formatAmount = (value) => {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const openModal = async (modal) => {
    setActiveModal(modal);
    setAmount("");

    if (modal == "send") {
      setRecipient(null);
      setWalletID("");
      setIsMatch(true);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setAmount("");
    setRecipient("");
  };

  const changeWalletID = (value) => {
    setWalletID(value);
    if (recipientLookupTimer.current) clearTimeout(recipientLookupTimer.current);
    const trimmed = value.trim();
    if (!trimmed) {
      setRecipient(null);
      setIsMatch(true);
      return;
    }
    recipientLookupTimer.current = setTimeout(async () => {
      try {
        const res = await lookupRecipientByPolyWalletId(trimmed);
        if (res?.user) {
          setRecipient(res.user);
          setIsMatch(true);
        } else {
          setRecipient(null);
          setIsMatch(false);
        }
      } catch {
        setRecipient(null);
        setIsMatch(false);
      }
    }, 400);
  };

  const handleAction = async () => {
    if (!activeModal) return;

    setLoading(true);
    try {
      if (activeModal === "deposit") {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          toast.error("Enter a valid deposit amount");
          setLoading(false);
          return;
        }
        if (!address) {
          toast.error("Connect your wallet before depositing");
          setLoading(false);
          return;
        }
        if (numericAmount > walletUsdcBalance) {
          toast.info("Insufficient USDC balance in your wallet");
          setLoading(false);
          return;
        }
        if (!(await ensurePolygonChain())) {
          setLoading(false);
          return;
        }

        let txHash;
        try {
          toast.info("Confirm the USDC transfer in your wallet…");
          txHash = await sendUsdcDeposit({
            amount: numericAmount,
            account: address,
          });
        } catch (transferErr) {
          toast.error(getDepositTransferErrorMessage(transferErr));
          setLoading(false);
          return;
        }

        let result;
        try {
          result = await submitDepositWithRetry(numericAmount, txHash);
        } catch (apiErr) {
          const msg =
            apiErr?.response?.data?.message ||
            "Deposit could not be credited. Your USDC transfer may still have succeeded — use Sync deposit below.";
          toast.error(msg);
          setPendingDeposit(loadPendingDeposit());
          setLoading(false);
          return;
        }

        if (result.ok) {
          toast.success(result.response?.message || "Deposit successful");
          await applyDepositSuccess(result.response);
          setPendingDeposit(null);
          closeModal();
        } else if (result.pending) {
          toast.warn(
            result.response?.message ||
              "Transfer detected on-chain. Tap Sync deposit in a few seconds.",
          );
          setPendingDeposit(loadPendingDeposit());
        } else {
          toast.warn(result.response?.message || "Deposit failed");
        }
      } else if (activeModal === "withdraw") {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          toast.error("Enter a valid withdrawal amount");
          setLoading(false);
          return;
        }
        const fee = parseFloat((numericAmount * 0.05).toFixed(8));
        const totalDeduction = numericAmount + fee;
        if (totalDeduction > Number(user.polyBalance)) {
          toast.info(`Insufficient balance. Amount + fee (5%) = ${totalDeduction.toFixed(2)}, your balance: ${Number(user.polyBalance).toFixed(2)}`);
          setLoading(false);
          return;
        }
        if (numericAmount < 1) {
          toast.info("Minimum Withdrawal amount is 100 USD");
          setLoading(false);
          return;
        }
        const response = await withdraw(numericAmount, fee);
        if (response?.message) {
          toast.success(response.message);
        } else {
          toast.warn("Withdrawal request failed");
        }
        closeModal();
        refreshUser();
      } else {
        if (!isMatch || !recipient) {
          toast.info("Please input correct PolyWallet ID");
          setLoading(false);
          return;
        }
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          toast.error("Enter a valid amount");
          setLoading(false);
          return;
        }
        if (numericAmount > Number(user.polyBalance)) {
          toast.info("Your Balance is insufficient");
          setLoading(false);
          return;
        }
        const response = await sendBalance(recipient.id, numericAmount);
        if (response?.flag) {
          toast.success(response.message || "Transfer successful");
        } else {
          toast.info(response?.message || "Please try again!");
        }
        closeModal();
        if (response?.flag) refreshUser();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Hide withdrawal entries until admin marks them completed
  const transactions = (user.transactions || []).filter(
    (tx) => tx.type !== 'withdraw' || String(tx.status || '').toLowerCase() === 'completed'
  );
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  return (
    <LayoutADesktop>
      <div className="relative">
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            {t("navWallet", "Wallet")}
          </h1>
          <HeaderActionsA />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {t("totalBalance", "TOTAL BALANCE")}
          </p>
          <h2 className="mt-2 text-5xl font-black tracking-tight text-gray-900">
            ${formatAmount(user.polyBalance)}
          </h2>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {t("totalInvest", "TOTAL INTEREST")}
                </p>
                <p className="mt-3 text-[26px] font-black text-gray-900">
                  ${formatAmount(user.interest)}
                </p>
                <div className="mt-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-xs font-bold text-blue-600">
                    + ${formatAmount(user.dailyInterest)}
                  </p>
                  <span className="w-fit max-w-full truncate rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                    {interestApyLabel} {t("apy", "APY")}
                  </span>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {t("totalBonus", "Affiliate Bonus")}
                </p>
                <p className="mt-3 text-[26px] font-black text-gray-900">
                  ${formatAmount(user.bonus)}
                </p>
                <div className="mt-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-xs font-bold text-blue-600">
                    + ${formatAmount(user.dailyBonus)} {t("today", "today")}
                  </p>
                </div>
              </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => openModal("deposit")}
              className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-blue-600 text-sm font-bold text-white shadow-lg ring-4 ring-blue-500/10 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <ArrowDown size={16} strokeWidth={2.5} />
              <span>{t("deposit", "Deposit")}</span>
            </button>
            <button
              type="button"
              onClick={() => openModal("withdraw")}
              className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-gray-200 bg-white text-sm font-bold text-gray-900 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
              <span>{t("withdraw", "Withdraw")}</span>
            </button>
            <button
              type="button"
              onClick={() => openModal("send")}
              className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-gray-200 bg-white text-sm font-bold text-gray-900 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Send size={16} strokeWidth={2.5} />
              <span>{t("send", "Send")}</span>
            </button>
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between px-0.5">
              <h3 className="text-lg font-black tracking-tight text-gray-900">
                {t("recentTransactions", "Transactions")}
              </h3>
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600"
              >
                {showAllTransactions
                  ? t("showLess", "Show less")
                  : t("seeAll", "See all")}
              </button>
            </div>

            {visibleTransactions.length > 0 ? (
              <div className="space-y-3">
                {visibleTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-4 rounded-[20px] border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all hover:shadow-md"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tx.symbol ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                    >
                      {tx.symbol ? (
                        <ArrowDownLeft size={22} strokeWidth={2.25} />
                      ) : (
                        <ArrowUpRight size={22} strokeWidth={2.25} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold capitalize text-gray-900">
                        {t(tx.type, tx.type)}
                        {tx.type === "transfer" ? ` - ${tx.note}` : ""}
                      </h4>
                      <p className="mt-1 text-sm font-medium text-gray-400">
                        {format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`block text-base font-bold tabular-nums ${tx.symbol ? "text-green-600" : "text-red-500"}`}
                      >
                        {tx.symbol ? "+" : "-"}${formatAmount(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-1 text-sm font-medium text-gray-400">No Data</p>
            )}
          </div>
        </div>

        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
            <div
              className="absolute inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
              onClick={closeModal}
            ></div>

            <div className="bg-white w-full sm:w-[400px] rounded-t-[32px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 shadow-2xl relative z-10 animate-slide-up sm:animate-pop-in">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {activeModal === "deposit"
                    ? t("depositUsdc", "Deposit")
                    : activeModal === "withdraw"
                      ? t("withdraw", "Withdraw")
                      : t("send", "Send")}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {activeModal === "deposit" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("amount", "Amount")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("enterAmount", "Enter amount")}
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="w-full bg-gray-50 rounded-[20px] px-5 py-4 font-bold text-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAmount(formatAmount(walletUsdcBalance))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 lg:active:scale-95"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 font-medium flex justify-between px-2">
                        <span>
                          {t("balance", "Balance")}:{" "}
                          {formatAmount(walletUsdcBalance)} USDC (Polygon)
                        </span>
                      </p>
                      {pendingDeposit?.txHash && (
                        <button
                          type="button"
                          className="w-full text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-3 px-4"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const result = await syncPendingDepositIfAny();
                              if (result?.ok) {
                                toast.success("Deposit synced to your balance");
                                await applyDepositSuccess(result.response);
                                setPendingDeposit(null);
                                closeModal();
                              } else {
                                toast.warn(
                                  result?.response?.message ||
                                    "Still waiting for Polygon confirmation. Try again shortly.",
                                );
                              }
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Sync pending deposit
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleAction}
                      className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      {t("confirmDeposit", "Confirm Deposit")}
                    </button>
                  </>
                )}

                {activeModal === "withdraw" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("amount", "Amount")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("enterAmount", "Enter amount")}
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="w-full bg-gray-50 rounded-[20px] px-5 py-4 font-bold text-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAmount(parseFloat((Number(user.polyBalance) / 1.05).toFixed(2)))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          MAX
                        </button>
                      </div>
                      {Number(amount) > 0 && (
                        <div className="bg-gray-50 rounded-[16px] px-4 py-3 text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Withdrawal amount</span>
                            <span className="font-bold text-gray-700">{Number(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform fee (5%)</span>
                            <span className="font-bold text-red-500">-{(Number(amount) * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-1">
                            <span className="font-bold text-gray-700">Total deducted from balance</span>
                            <span className="font-bold text-gray-900">{(Number(amount) * 1.05).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-[20px] flex items-center gap-3 border border-yellow-100">
                      <Clock size={18} className="text-yellow-600" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-yellow-700">
                          {t("processing", "Processing")}{" "}
                          {t("withinBusinessDays", "Within 3 business days")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAction}
                      className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-bold text-lg shadow-lg hover:bg-black active:scale-[0.98] transition-all"
                    >
                      {t("requestWithdrawal", "Request Withdrawal")}
                    </button>
                  </>
                )}

                {activeModal === "send" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("recipientId", "Recipient ID")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("enterUserId", "Enter user ID")}
                        value={walletID}
                        onChange={(e) => changeWalletID(e.target.value)}
                        className={`w-full bg-gray-50 rounded-[20px] px-5 py-4 font-bold text-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 ${isMatch ? "" : "border border-[#FF0000]"} `}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("amount", "Amount")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("enterAmount", "Enter amount")}
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="w-full bg-gray-50 rounded-[20px] px-5 py-4 font-bold text-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAmount(formatAmount(user.polyBalance))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleAction}
                      className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      {t("sendNow", "Send Now")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutADesktop>
  );
}
