import React from "react";
import { X } from "lucide-react";
import { listWalletOptions } from "../../utils/walletConnection.js";
import { CONNECTOR_KEYS } from "../../config/wallets.js";

export default function WalletPickerModal({ open, onClose, onSelect, busy }) {
  if (!open) return null;

  const options = listWalletOptions();

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-picker-title"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2
            id="wallet-picker-title"
            className="text-lg font-black text-gray-900"
          >
            Connect wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-4 text-sm text-gray-500">
          Bitget Wallet is recommended. On mobile Chrome, open the Bitget app or
          connect in the browser with WalletConnect.
        </p>

        <div className="px-4 pb-6 space-y-3">
          {options.map((option) => {
            const isPrimary =
              option.recommended ||
              option.key === CONNECTOR_KEYS.bitget;
            return (
              <button
                key={`${option.key}-${option.mode ?? "default"}`}
                type="button"
                disabled={busy}
                onClick={() => onSelect(option.key)}
                className={`w-full rounded-2xl py-4 px-5 text-left transition-all active:scale-[0.98] ${
                  busy ? "opacity-60 pointer-events-none" : ""
                } ${
                  isPrimary
                    ? "bg-[#0F1115] text-white hover:bg-black"
                    : "border-2 border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p
                  className={`font-bold text-base ${
                    isPrimary ? "text-white" : "text-gray-900"
                  }`}
                >
                  {option.title}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isPrimary ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {option.subtitle}
                </p>
              </button>
            );
          })}

          {options.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No wallet connectors available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
