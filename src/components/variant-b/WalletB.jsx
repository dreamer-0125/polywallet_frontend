import React, { useState } from 'react';
import LayoutB from './LayoutB';
import { Plus, ArrowUpRight, ArrowDownLeft, X, Send, Sparkles, Gift, Box, Rocket, ChevronRight, Clock, Globe, ChevronDown } from 'lucide-react';
import { useLocale } from '../../i18n';
import Logo from '../../assets/LOGO.svg';

export default function WalletB() {
    const { t } = useLocale();
    const [activeModal, setActiveModal] = useState(null);
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const walletAddress = '0x742d...5f3A';

    const transactions = [
        { type: t('dailyInterest', 'Daily Interest'), date: '2026-01-16 14:30:45', amount: '+$11.23', color: 'text-green-600', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600', Icon: Sparkles },
        { type: t('directBonus', 'Direct Bonus'), date: '2026-01-16 10:15:22', amount: '+$150.00', color: 'text-green-600', iconBg: 'bg-pink-50', iconColor: 'text-pink-600', Icon: Gift },
        { type: t('teamBonus', 'Team Bonus'), date: '2026-01-15 18:42:11', amount: '+$85.50', color: 'text-green-600', iconBg: 'bg-pink-50', iconColor: 'text-pink-600', Icon: Gift },
        { type: t('nftMint', 'NFT Mint'), date: '2026-01-15 09:20:33', amount: '-$1,000.00', color: 'text-red-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', Icon: Box },
        { type: t('transferAlice', 'Transfer - alice123'), date: '2026-01-14 16:55:18', amount: '-$250.00', color: 'text-red-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', Icon: Send },
        { type: t('deposit', 'Deposit'), date: '2026-01-14 12:30:00', amount: '+$2,000.00', color: 'text-green-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', Icon: ArrowDownLeft },
        { type: t('withdrawTx', 'Withdraw'), date: '2026-01-13 20:15:42', amount: '-$500.00', color: 'text-red-500', iconBg: 'bg-red-50', iconColor: 'text-red-600', Icon: ArrowUpRight },
        { type: t('dailyInterest', 'Daily Interest'), date: '2026-01-13 14:30:45', amount: '+$10.87', color: 'text-green-600', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600', Icon: Sparkles },
    ];
    const visibleTransactions = showAllTransactions ? transactions : transactions.slice(0, 4);

    const closeModal = () => {
        setActiveModal(null);
        setAmount('');
        setRecipient('');
    };

    return (
        <LayoutB>
            {/* Main Content - PADDING REDUCED START */}
            <div className="px-6 pt-2 pb-4 space-y-3">

                {/* 1. Header with Logo and Wallet Address */}
                <div className="flex justify-between items-center mb-2">
                    <img src={Logo} alt="PolyWallet Logo" className="h-7 w-auto" style={{ filter: 'invert(0)' }} />
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
                            <Globe size={16} />
                        </button>
                        <div className="bg-[#1A1D1F] text-white px-3 py-2 rounded-full flex items-center gap-1.5 shadow-md text-[10px] font-bold">
                            <span>{walletAddress}</span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Main Balance - Gap Reduced */}
                <div className="text-center space-y-4 py-0">
                    <div>
                        <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase mb-1">{t('totalBalance', 'TOTAL BALANCE')}</p>
                        <h1 className="text-[44px] font-black text-gray-900 tracking-tight leading-none">$5,420<span className="text-gray-400">.50</span></h1>
                    </div>

                    {/* Stats Cards - REDUCED SHADOWS */}
                    <div className="flex gap-4 px-1">
                        <div className="flex-1 bg-white p-4 rounded-[24px] shadow-[0_6px_20px_-5px_rgba(0,0,0,0.02)] text-left border border-gray-50">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('totalInvest', 'TOTAL INTEREST')}</p>
                            <p className="text-xl font-black text-green-600">$1,248.50</p>
                            <div className="mt-1 flex items-center justify-between">
                                <p className="text-[10px] text-green-500 font-bold">+ $11.23</p>
                                <span className="bg-green-50 text-green-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-green-100">{t('apy', 'APY')} 10%</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-[24px] shadow-[0_6px_20px_-5px_rgba(0,0,0,0.02)] text-left border border-gray-50">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('totalBonus', 'Total Bonus')}</p>
                            <p className="text-xl font-black text-blue-600">$398.20</p>
                            <p className="text-[10px] text-blue-500 font-bold mt-1">+ $85.50</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - 3 Buttons row - REDUCED SHADOWS */}
                <div className="flex items-center gap-3 px-1">
                    <button onClick={() => setActiveModal('deposit')} className="flex-1 h-14 bg-black rounded-[20px] flex items-center justify-center gap-2 shadow-[0_6px_15px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/10 rounded-t-[20px] pointer-events-none"></div>
                        <ArrowDownLeft size={18} className="text-white relative z-10" />
                        <span className="text-white font-bold text-[16px] relative z-10">{t('deposit', 'Deposit')}</span>
                    </button>
                    <button onClick={() => setActiveModal('withdraw')} className="flex-1 h-14 bg-white rounded-[20px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <ArrowUpRight size={18} className="text-gray-900" />
                        <span className="text-gray-900 font-bold text-[16px]">{t('withdraw', 'Withdraw')}</span>
                    </button>
                    <button onClick={() => setActiveModal('send')} className="flex-1 h-14 bg-white rounded-[20px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Send size={16} className="text-gray-900" />
                        <span className="text-gray-900 font-bold text-[16px]">{t('send', 'Send')}</span>
                    </button>
                </div>

                {/* 2. Upgrade Pro Banner - NEW & ANIMATED - REDUCED SHADOWS */}
                <div className="hidden relative overflow-hidden bg-[#1A1D1F] p-6 rounded-[32px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] text-white flex justify-between items-center group cursor-pointer hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-black text-xl tracking-tight">{t('upgradePro', 'UPGRADE PRO')}</h3>
                            {/* Rocket Icon Requested */}
                            <Rocket size={20} className="text-white animate-bounce" />
                        </div>
                        <p className="text-gray-400 text-xs font-medium max-w-[160px] leading-relaxed">
                            {t('upgradeDesc', 'Elevate your productivity and achieve more with our Pro plan!')}
                        </p>
                    </div>

                    {/* Animated Floating Icon */}
                    <div className="relative z-10 w-20 h-20 shrink-0 flex items-center justify-center self-center">
                        {/* Breathing Ring - Custom Animation */}
                        <div className="absolute w-full h-full rounded-full border border-white/20 animate-breathe"></div>

                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl animate-breathe-strong">
                            <ArrowUpRight size={20} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Transactions - REDUCED SHADOWS */}
                <div className="px-1 pb-12">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-lg font-black text-gray-900">{t('transactions', 'Transactions')}</h3>
                        <button
                            type="button"
                            onClick={() => setShowAllTransactions((prev) => !prev)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            {showAllTransactions ? t('showLess', 'Show less') : t('seeAll', 'See all')}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {visibleTransactions.map((tx, i) => (
                            <div key={i} className="group bg-white p-4 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-gray-50 flex items-center gap-4 transition-all hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-default">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.iconBg}`}>
                                    <tx.Icon size={18} className={tx.iconColor} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{tx.type}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-black text-sm ${tx.color}`}>{tx.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ========== DEPOSIT MODAL ========== */}
                {activeModal === 'deposit' && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
                        <div className="bg-white w-full sm:w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 sm:pb-8 shadow-2xl relative z-10 animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">{t('depositUsdc', 'Deposit')}</h2>
                                <button onClick={closeModal} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-gray-500">{t('amount', 'Amount')}</span>
                                        <button className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">MAX</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('enterAmount', 'Enter amount')}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-4 text-lg font-bold text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                    />
                                    <p className="text-right text-xs text-gray-400 font-medium mt-2">{t('balance', 'Balance')}: 8,234.56 USDC (Polygon)</p>
                                </div>

                                <button onClick={closeModal} className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base rounded-[16px] shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all">
                                    {t('confirmDeposit', 'Confirm Deposit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== WITHDRAW MODAL ========== */}
                {activeModal === 'withdraw' && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
                        <div className="bg-white w-full sm:w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 sm:pb-8 shadow-2xl relative z-10 animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">{t('withdraw', 'Withdraw')}</h2>
                                <button onClick={closeModal} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-gray-500">{t('amount', 'Amount')}</span>
                                        <button className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">MAX</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('enterAmount', 'Enter amount')}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-4 text-lg font-bold text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Processing Time Info */}
                                <div className="bg-yellow-50 rounded-[16px] p-4 flex items-center gap-3 border border-yellow-100">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                        <Clock size={16} className="text-yellow-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-yellow-700">{t('processing', 'Processing')}</p>
                                        <p className="text-xs font-medium text-yellow-600/80">{t('processingTime', 'Within 3 business days')}</p>
                                    </div>
                                </div>

                                <button onClick={closeModal} className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base rounded-[16px] shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all">
                                    {t('requestWithdrawal', 'Request Withdrawal')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== SEND MODAL ========== */}
                {activeModal === 'send' && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
                        <div className="bg-white w-full sm:w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 sm:pb-8 shadow-2xl relative z-10 animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">{t('send', 'Send')}</h2>
                                <button onClick={closeModal} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm font-bold text-gray-500 block mb-2">{t('recipientId', 'Recipient ID')}</span>
                                    <input
                                        type="text"
                                        placeholder={t('enterUserId', 'Enter user ID')}
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-4 text-lg font-bold text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-gray-500">{t('amount', 'Amount')}</span>
                                        <button className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">MAX</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('enterAmount', 'Enter amount')}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-4 text-lg font-bold text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <button onClick={closeModal} className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base rounded-[16px] shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all">
                                    {t('sendNow', 'Send Now')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LayoutB>
    );
}
