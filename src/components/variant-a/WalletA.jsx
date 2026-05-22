import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  deposit,
  getAllIDs,
  sendBalance,
  withdraw,
} from "../../api/backendAPI";
import { getUSDCBalance } from "../../utils";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function WalletA() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user, setUser } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'deposit', 'withdraw', 'send'
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [allIDs, setAllIDs] = useState([]);
  const [isMatch, setIsMatch] = useState(true);
  const [walletID, setWalletID] = useState("");

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

  const formatAmount = (value) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const openModal = async (modal) => {
    setActiveModal(modal);
    setAmount("");

    if (modal == "send") {
      // get All IDs
      const response = await getAllIDs(user.id);
      if (response.users) {
        setAllIDs(response.users);
      }
      console.log(response);
      setRecipient(null);
      setWalletID("");
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setAmount("");
    setRecipient("");
  };

  const transactions = user.transactions || [];
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  const changeWalleID = (value) => {
    setWalletID(value);
    const match = allIDs.filter((item) => item.polyWalletID == value)[0];
    if (match) {
      setRecipient(match);
      setIsMatch(true);
    } else {
      setIsMatch(false);
      setRecipient(null);
    }
  };

  const handleAction = async () => {
    if (!activeModal) return;

    setLoading(true);
    if (activeModal == "deposit") {
      // deposit action
      const usdcBalance = await getUSDCBalance(user.walletAddress);
      const response = await deposit(user.id, amount, Number(usdcBalance));
      if (response.user) {
        setUser(response.user);
        toast.success("Deposit Success");
      } else {
        toast.warn("Please try again later");
      }
      closeModal();
    } else if (activeModal == "withdraw") {
      // withdaw action
      if (amount > user.polyBalance) {
        toast.info("Your Balance is insufficient");
        setLoading(false);
        return;
      }
      if (amount < 100) {
        toast.info("Minimum Withdrawal amount is 100 USD");
        setLoading(false);
      } else {
        const fee = Number(amount) * 0.05;
        const response = await withdraw(user.id, amount, fee);
        if (response.user) {
          setUser(response.user);
          toast.success("Withdrawal request is sent");
        } else {
          toast.warn("Please try again later");
        }
        closeModal();
      }
    } else {
      // send balance to user

      if (!isMatch) {
        toast.info("Pleas input correct PolyWallet ID");
        setLoading(false);
        return;
      }
      if (amount > user.polyBalance) {
        toast.info("Your Balance is insufficient");
        setLoading(false);
        return;
      }

      const response = await sendBalance(user.id, recipient.id, amount);
      if (response.user) {
        setUser(response.user);
        toast.success("Transfer Success");
      } else {
        toast.info("Please try again!");
      }

      closeModal();
    }

    setLoading(false);
  };

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
              <h2 className="md:text-4xl text-4xl font-black text-gray-900 tracking-tight mt-3">
                ${formatAmount(user.polyBalance)}
              </h2>
            </div>

            <div className="mt-[10px] flex gap-[13px]">
              <div className="bg-white px-4 py-[15px] h-[121px] rounded-2xl flex-1 border border-gray-300">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  {t("totalInvest", "TOTAL INTEREST")}
                </p>
                <p className="text-[22px] font-black text-gray-900 mt-3">
                  ${formatAmount(user.interest)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[12px] text-blue-600 font-bold">
                    + ${formatAmount(user.dailyInterest)}
                  </p>
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                    {t("apy", "APY")} 10%
                  </span>
                </div>
              </div>
              <div className="bg-white px-4 py-[15px] h-[121px] rounded-2xl flex-1 border border-gray-300">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  {t("totalBonus", "Total Bonus")}
                </p>
                <p className="text-[22px] font-black text-gray-900 mt-3">
                  ${formatAmount(user.bonus)}
                </p>
                <p className="text-[12px] text-blue-600 font-bold mt-2">
                  + ${formatAmount(user.dailyBonus)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-[11px] flex items-center gap-[9px]">
            <button
              onClick={() => openModal("deposit")}
              className="flex-1 h-12 bg-blue-600 text-white rounded-[18px] shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-[14px] ring-4 ring-blue-500/10"
            >
              <ArrowDown size={16} strokeWidth={2.5} />
              {t("deposit", "Deposit")}
            </button>
            <button
              onClick={() => openModal("withdraw")}
              className="flex-1 h-12 bg-white rounded-[18px] shadow-soft hover:shadow-soft-hover active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-gray-900 text-[14px] border border-gray-100"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
              {t("withdraw", "Withdraw")}
            </button>
            <button
              onClick={() => openModal("send")}
              className="flex-1 h-12 bg-white rounded-[18px] shadow-soft hover:shadow-soft-hover active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-gray-900 text-[14px] border border-gray-100"
            >
              <Send size={16} className="text-gray-900" strokeWidth={2.5} />
              {t("send", "Send")}
            </button>
          </div>

          {/* Banner */}
          <div className="hidden relative w-full h-36 bg-gray-900 rounded-[24px] overflow-hidden flex items-center justify-between px-6 shadow-xl border border-black/5 group">
            <div className="relative z-10 space-y-1 max-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-black text-lg tracking-wide">
                  {t("upgradePro", "UPGRADE PRO")}
                </span>
                <Rocket size={20} className="text-white" />
              </div>
              <p className="text-gray-400 text-xs font-medium max-w-[200px] leading-relaxed">
                {t(
                  "upgradeDesc",
                  "Elevate your productivity and achieve more with our Pro plan!",
                )}
              </p>
            </div>

            <div className="relative z-10 w-20 h-20 flex items-center justify-center self-center">
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.05)] animate-breathe"></div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center shadow-inner animate-breathe-strong">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-[180px] bg-gradient-to-l from-gray-800 to-transparent"></div>
          </div>

          {/* Transactions */}
          <div className="mt-[40px]">
            <div className="flex justify-between items-end px-1 mb-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {t("transactions", "Transactions")}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllTransactions((prev) => !prev)}
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
                        {t(tx.type, tx.type)}{tx.type == "Transfer" ? ` - ${tx.note}` : ""}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {format(tx.createdAt, "yyyy-MM-dd HH:mm:ss")}
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
                            setAmount(formatAmount(user.usdcBalance))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 lg:active:scale-95"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 font-medium flex justify-between px-2">
                        <span>
                          {t("balance", "Balance")}:{" "}
                          {formatAmount(user.usdcBalance)} USDC (Polygon)
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
                      <div
                        className={`relative ${isMatch ? "" : "rounded-[20px] border border-[#FF0000]"}`}
                      >
                        <input
                          type="text"
                          placeholder={t("enterUserId", "Enter user ID")}
                          value={walletID}
                          onChange={(e) => changeWalleID(e.target.value)}
                          className="w-full bg-gray-50 rounded-[20px] px-5 py-4 font-bold text-xl text-gray-900 outline-none"
                        />
                      </div>
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
