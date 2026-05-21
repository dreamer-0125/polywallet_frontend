import React from "react";
import { X } from "lucide-react";
import { listWalletOptions } from "../../utils/walletConnection.js";
import { CONNECTOR_KEYS } from "../../config/wallets.js";

export default function WalletPickerModal({ open, onClose, onSelect, busy }) {
  if (!open) return null;

  const options = listWalletOptions();
  const bitget = options.find((o) => o.key === CONNECTOR_KEYS.bitget);
  const walletConnect = options.find((o) => o.key === CONNECTOR_KEYS.walletConnect);

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
          Bitget Wallet is recommended. Use WalletConnect for Trust or MetaMask on
          mobile.
        </p>

        <div className="px-4 pb-6 space-y-3">
          {bitget && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSelect(CONNECTOR_KEYS.bitget)}
              className={`w-full rounded-2xl bg-[#0F1115] text-white py-4 px-5 text-left transition-all hover:bg-black active:scale-[0.98] ${
                busy ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <p className="font-bold text-base">Bitget Wallet</p>
              <p className="text-xs text-white/70 mt-1">Recommended</p>
            </button>
          )}

          {walletConnect && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSelect(CONNECTOR_KEYS.walletConnect)}
              className={`w-full rounded-2xl border-2 border-gray-200 bg-white py-4 px-5 text-left transition-all hover:border-gray-300 active:scale-[0.98] ${
                busy ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <p className="font-bold text-gray-900">WalletConnect</p>
              <p className="text-xs text-gray-500 mt-1">
                Bitget, Trust Wallet, or MetaMask
              </p>
            </button>
          )}

          {!bitget && !walletConnect && (
            <p className="text-sm text-gray-500 text-center py-4">
              No wallet connectors available. Open this site in Bitget Wallet or
              install a browser extension.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
