import React, { useState } from "react";
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
import { format } from "date-fns";
import { getUSDCBalance } from "../../utils";
import { deposit, getAllIDs, sendBalance, withdraw } from "../../api/backendAPI";
import { toast } from "react-toastify";

export default function WalletADesktop() {
  const { t } = useLocale();

  const { setLoading } = useLoadingContext();
  const { user, setUser } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [allIDs, setAllIDs] = useState([]);
  const [isMatch, setIsMatch] = useState(true);
  const [walletID, setWalletID] = useState("");

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
    <LayoutADesktop>
      <div className="space-y-6">
        {/* Header with Page Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t("navWallet", "Wallet")}
          </h1>
          <HeaderActionsA />
        </div>

        {/* Balance Section - SAME DESIGN AS MOBILE */}
        <div>
          <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">
            {t("totalBalance", "TOTAL BALANCE")}
          </p>
          <h2 className="text-5xl font-black text-gray-900 tracking-tight mt-3">
            ${formatAmount(user.polyBalance)}
          </h2>
        </div>

        {/* TOTAL INTEREST & TOTAL BONUS Cards - SAME AS MOBILE */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white px-5 py-4 rounded-2xl border border-gray-300">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              {t("totalInvest", "TOTAL INTEREST")}
            </p>
            <p className="text-[26px] font-black text-gray-900 mt-3">
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
          <div className="bg-white px-5 py-4 rounded-2xl border border-gray-300">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              {t("totalBonus", "TOTAL BONUS")}
            </p>
            <p className="text-[26px] font-black text-gray-900 mt-3">
              ${formatAmount(user.bonus)}
            </p>
            <p className="text-[12px] text-blue-600 font-bold mt-2">
              + ${formatAmount(user.dailyBonus)}
            </p>
          </div>
        </div>

        {/* Action Buttons - SAME AS MOBILE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("deposit")}
            className="flex-1 h-14 bg-blue-600 text-white rounded-[18px] shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-bold text-[15px] ring-4 ring-blue-500/10"
          >
            <ArrowDown size={18} strokeWidth={2.5} />
            {t("deposit", "Deposit")}
          </button>
          <button
            onClick={() => openModal("withdraw")}
            className="flex-1 h-14 bg-white rounded-[18px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-bold text-gray-900 text-[15px] border border-gray-200"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
            {t("withdraw", "Withdraw")}
          </button>
          <button
            onClick={() => openModal("send")}
            className="flex-1 h-14 bg-white rounded-[18px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-bold text-gray-900 text-[15px] border border-gray-200"
          >
            <Send size={18} className="text-gray-900" strokeWidth={2.5} />
            {t("send", "Send")}
          </button>
        </div>

        {/* Transactions Section - SAME AS MOBILE */}
        <div className="space-y-4 mt-8">
          <div className="flex justify-between items-end px-1">
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

          {/* Transaction List - SINGLE COLUMN */}
          <div className="grid grid-cols-1 gap-3">
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
                  <h4 className="font-bold text-gray-900 text-sm">{t(tx.type, tx.type)}{tx.type == "Transfer" ? ` - ${tx.note}` : ""}</h4>
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
        </div>
      </div>

      {/* MODALS - SAME AS MOBILE */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="bg-white w-full max-w-[420px] rounded-[32px] p-6 shadow-2xl relative z-10 animate-pop-in">
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
                          setAmount(formatAmount(user.usdcBalance))
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
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
                    <p className="text-sm font-bold text-yellow-700">
                      {t("processing", "Processing")}{" "}
                      {t("withinBusinessDays", "Within 3 business days")}
                    </p>
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
                      onChange={(event) => changeWalleID(event.target.value)}
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
    </LayoutADesktop>
  );
}
