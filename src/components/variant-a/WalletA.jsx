import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import LayoutA from "./LayoutA";
import HeaderActionsA from "./HeaderActionsA";
import { useLocale } from "../../i18n";
import {
  Send,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  X,
  Clock,
  Rocket,
} from "lucide-react";
import Logo from "../../assets/LOGO-black.svg";
import { useLoadingContext } from "../../context/LoadingContext";
import { useAuth } from "../../context/AuthContext";
import { formatRatePercent } from "../../context/WalletConfigContext";
import {
  deposit,
  lookupRecipientByPolyWalletId,
  sendBalance,
  withdraw,
} from "../../api";
import { toast } from "react-toastify";
import { format } from "date-fns";
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
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
];

export default function WalletA() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user, setUser, refreshUser } = useAuth();

  const applyDepositSuccess = async (response) => {
    if (response?.user) {
      setUser((prev) =>
        prev ? { ...prev, ...response.user } : response.user,
      );
    }
    await refreshUser();
  };
  const { address } = useAccount();
  const { data: rawUsdcBalance } = useReadContract({
    address: POLYGON_USDC,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  });
  // USDC on Polygon uses 6 decimals
  const walletUsdcBalance = rawUsdcBalance != null ? Number(rawUsdcBalance) / 1e6 : 0;
  const [activeModal, setActiveModal] = useState(null); // 'deposit', 'withdraw', 'send'
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isMatch, setIsMatch] = useState(true);
  const [walletID, setWalletID] = useState("");
  const recipientLookupTimer = useRef(null);
  const interestApyLabel = formatRatePercent(user?.rates?.balanceInterestApy);
  const commissionLabel = formatRatePercent(user?.rates?.bonusRate);

  // Responsive Guard: Redirect to Desktop if screen grows (>= 768px)
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth >= 768) {
        navigate("/desktop/wallet", { replace: true });
      }
    };

    checkSize(); // Check on mount
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

        let response;
        try {
          response = await deposit(numericAmount, txHash);
        } catch (apiErr) {
          const msg =
            apiErr?.response?.data?.message ||
            "Deposit could not be credited. Your USDC transfer may still have succeeded — contact support with your tx hash.";
          toast.error(msg);
          setLoading(false);
          return;
        }

        if (response?.depositRequest?.status === "approved") {
          toast.success(response.message || "Deposit successful");
          await applyDepositSuccess(response);
        } else if (response?.depositRequest) {
          toast.success(response.message || "Deposit submitted");
          await applyDepositSuccess(response);
        } else {
          toast.warn(response?.message || "Deposit failed");
        }
        closeModal();
      } else if (activeModal === "withdraw") {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          toast.error("Enter a valid withdrawal amount");
          setLoading(false);
          return;
        }
        if (numericAmount > Number(user.polyBalance)) {
          toast.info("Your Balance is insufficient");
          setLoading(false);
          return;
        }
        if (numericAmount < 1) {
          toast.info("Minimum Withdrawal amount is 100 USD");
          setLoading(false);
          return;
        }
        const fee = numericAmount * 0.05;
        const response = await withdraw(numericAmount, fee);
        if (response?.message) {
          toast.success(response.message);
        } else {
          toast.warn("Withdrawal request failed");
        }
        closeModal();
        refreshUser();
      } else {
        // send balance to user
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
    <LayoutA>
      <div className="relative">
        <div className="px-6 pt-2 pb-4 space-y-3">
          {/* Header with Logo and Wallet Address (with dropdowns) */}
          <div className="sticky top-0 z-40 bg-[#F9FAFB]/80 backdrop-blur-xl py-2 -mx-6 px-6 border-b border-gray-100/50 flex justify-between items-center transition-all duration-300">
            <img src={Logo} alt="PolyWallet" className="h-5 w-auto" />
            <HeaderActionsA />
          </div>

          {/* Balance Section */}
          <div>
            <div className="-mx-[13px] -mt-1 px-[13px] py-[13px]">
              <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">
                {t("totalBalance", "TOTAL BALANCE")}
              </p>
              <h2 className="md:text-4xl text-5xl font-black text-gray-900 tracking-tight mt-3">
                ${formatAmount(user.polyBalance)}
              </h2>
            </div>

            <div className="mt-[10px] grid min-w-0 grid-cols-2 gap-2 sm:gap-[13px]">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-300 bg-white px-2.5 py-3 sm:px-4 sm:py-[15px]">
                <p className="truncate text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  {t("totalInvest", "TOTAL INTEREST")}
                </p>
                <p className="mt-2 text-xl font-black text-gray-900 sm:mt-3 sm:text-[26px]">
                  ${formatAmount(user.interest)}
                </p>
                <div className="mt-2 flex min-w-0 flex-col gap-1">
                  <p className="truncate text-[11px] font-bold text-blue-600 sm:text-[12px]">
                    + ${formatAmount(user.dailyInterest)}
                  </p>
                  <span className="w-fit max-w-full truncate rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                    {interestApyLabel} {t("apy", "APY")}
                  </span>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-300 bg-white px-2.5 py-3 sm:px-4 sm:py-[15px]">
                <p className="truncate text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  {t("totalBonus", "Total Bonus")}
                </p>
                <p className="mt-2 text-xl font-black text-gray-900 sm:mt-3 sm:text-[26px]">
                  ${formatAmount(user.bonus)}
                </p>
                <div className="mt-2 flex min-w-0 flex-col gap-1">
                  <p className="truncate text-[11px] font-bold text-blue-600 sm:text-[12px]">
                    + ${formatAmount(user.dailyBonus)}
                  </p>
                  <span className="w-fit max-w-full truncate rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                    {commissionLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-[11px] flex items-center gap-[9px]">
            <button
              onClick={() => openModal("deposit")}
              className="flex-1 h-12 bg-blue-600 text-white rounded-[18px] shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-[14px] ring-4 ring-blue-500/10"
            >
              <ArrowDown size={14} className="text-black-400" />
              <span>{t("deposit", "Deposit")}</span>
            </button>
            <button
              onClick={() => openModal("withdraw")}
              className="flex-1 h-12 bg-white rounded-[18px] shadow-soft hover:shadow-soft-hover active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-gray-900 text-[14px] border border-gray-100"
            >
              <ArrowUp size={14} className="text-black-400" />
              <span>{t("withdraw", "Withdraw")}</span>
            </button>
            <button
              onClick={() => openModal("send")}
              className="flex-1 h-12 bg-white rounded-[18px] shadow-soft hover:shadow-soft-hover active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-gray-900 text-[14px] border border-gray-100"
            >
              <Send size={14} className="text-black-400" />
              <span>{t("send", "Send")}</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex justify-between items-end px-1 mb-2">
              <h3 className="font-black text-gray-900 text-lg tracking-tight">
                {t("recentTransactions", "Transactions")}
              </h3>
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider"
              >
                {showAllTransactions
                  ? t("showLess", "Show less")
                  : t("seeAll", "See all")}
              </button>
            </div>

            {visibleTransactions.length > 0 ? (
              <div className="space-y-2.5">
                {visibleTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className="group bg-white p-4 rounded-[20px] shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-colors ${tx.symbol ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                    >
                      {tx.symbol ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {t(tx.type, tx.type)}{tx.type === 'transfer' ? ` - ${tx.note}` : ""}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`block font-bold ${tx.symbol ? "text-green-500" : "text-red-500"} tracking-tight`}
                      >
                        {tx.symbol ? "+" : "-"}${formatAmount(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4">No Data</div>
            )}
          </div>
        </div>

        {/* MODALS */}
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal Content */}
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

              {/* Dynamic Content based on Modal Type */}
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
                            setAmount(formatAmount(user.polyBalance))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          MAX
                        </button>
                      </div>
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
    </LayoutA>
  );
}
