import React from "react";
import { X, Wallet } from "lucide-react";
import { WALLET_IDS } from "../utils/walletAvailability.js";

const WALLETS = [
  {
    id: WALLET_IDS.bitget,
    name: "Bitget Wallet",
    subtitle: "Recommended",
  },
  {
    id: WALLET_IDS.metaMask,
    name: "MetaMask",
    subtitle: "Browser extension",
  },
  {
    id: WALLET_IDS.trust,
    name: "Trust Wallet",
    subtitle: "Mobile & extension",
  },
  {
    id: WALLET_IDS.walletConnect,
    name: "WalletConnect",
    subtitle: "Scan or open in app",
  },
];

export default function WalletPickerModal({ open, onClose, onSelect }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-picker-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2
            id="wallet-picker-title"
            className="text-lg font-bold text-[#0F1115]"
          >
            Select wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F3F5F7] flex items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-6 text-sm text-gray-500 pb-4">
          Connect on <span className="font-semibold text-[#0F1115]">Polygon</span>{" "}
          only
        </p>

        <ul className="px-4 pb-6 space-y-2">
          {WALLETS.map((wallet) => (
            <li key={wallet.id}>
              <button
                type="button"
                onClick={() => onSelect(wallet.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E8ECF0] hover:border-[#0F1115] hover:bg-[#F9FAFB] transition-colors text-left"
              >
                <span className="w-12 h-12 rounded-xl bg-[#0F1115] text-white flex items-center justify-center shrink-0">
                  <Wallet size={22} strokeWidth={2.5} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[#0F1115]">
                    {wallet.name}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {wallet.subtitle}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
