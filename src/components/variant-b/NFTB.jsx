import React, { useState } from 'react';
import LayoutB from './LayoutB';
import HeaderB from './HeaderB';
import { Box, Diamond, TrendingUp, Sparkles, Check, Star, X, Plus, Minus } from 'lucide-react';
import { useLocale } from '../../i18n';

export default function NFTB() {
    const { t } = useLocale();
    const [showMintModal, setShowMintModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const pricePerNFT = 1000;

    const benefits = [
        t('exclusiveAirdropRewards', 'Exclusive Airdrop Rewards'),
        t('upToPointBoost', 'Up to 60% Point Boost'),
        t('apyDailyInterestLabel', '10% APY Daily Interest'),
        t('ambassadorProgramAccess', 'Ambassador Program Access'),
    ];

    return (
        <LayoutB>
            <div className="px-6 pt-3 pb-4 space-y-4">
                <HeaderB title={t('nftMintTitle', 'NFT Mint')} />

                {/* Stats Row */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-white p-4 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border border-gray-50">
                        <Box className="mx-auto mb-2 text-gray-600" size={22} />
                        <p className="text-2xl font-black text-gray-900">3</p>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{t('owned', 'Owned')}</p>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border border-gray-50">
                        <Diamond className="mx-auto mb-2 text-blue-600" size={22} />
                        <p className="text-lg font-black text-gray-900">Diamond</p>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{t('rankTitle', 'Rank')}</p>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border border-gray-50">
                        <TrendingUp className="mx-auto mb-2 text-green-600" size={22} />
                        <p className="text-2xl font-black text-green-600">50%</p>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{t('boost', 'Boost')}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white p-2 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-50">
                    <div className="bg-gradient-to-b from-gray-50 to-white rounded-[32px] p-6 pb-8 relative overflow-hidden">

                        {/* Hero NFT Card - Premium Black/Gold */}
                        <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] mb-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
                            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>

                            <div className="w-20 h-20 rounded-[20px] bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-xl">
                                <Star size={36} className="text-yellow-400" fill="currentColor" />
                            </div>
                            <span className="font-black text-2xl tracking-[0.15em] mb-1">POLY</span>
                            <span className="text-xs font-bold text-white/60 tracking-widest uppercase">NFT BOX</span>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">{t('polywalletNft', 'PolyWallet NFT')}</h2>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                    {t('nftDescription', 'Mint your NFT to unlock rewards, daily interest, and affiliate benefits.')}
                                </p>
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-2.5">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-green-600" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price & Availability */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('mintPrice', 'Mint Price')}</p>
                                    <span className="font-black text-2xl text-gray-900">$1,000</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-600 font-bold text-xs flex items-center gap-1 justify-end mb-1">
                                        <Sparkles size={12} /> {t('limited', 'Limited')}
                                    </p>
                                    <span className="text-xs font-bold text-gray-500">3,247 / 10,000</span>
                                </div>
                            </div>

                            {/* Mint Button */}
                            <button
                                onClick={() => setShowMintModal(true)}
                                className="w-full h-16 bg-black rounded-[24px] text-white font-bold text-lg shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.4)]"
                            >
                                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[24px]"></div>
                                <Diamond size={20} className="relative z-10" />
                                <span className="relative z-10">{t('mintNft', 'Mint NFT')}</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* ========== MINT NFT MODAL ========== */}
                {showMintModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMintModal(false)}></div>
                        <div className="bg-white w-full sm:w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 sm:pb-8 shadow-2xl relative z-10 animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">{t('mintNft', 'Mint NFT')}</h2>
                                <button onClick={() => setShowMintModal(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Quantity Selector */}
                                <div>
                                    <span className="text-sm font-bold text-gray-500 block mb-3">{t('selectQuantity', 'Select Quantity')}</span>
                                    <div className="flex items-center justify-center gap-6">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-14 h-14 bg-gray-100 rounded-[16px] flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                                        >
                                            <Minus size={24} />
                                        </button>
                                        <div className="bg-gray-50 border border-gray-100 rounded-[20px] px-10 py-4 text-center min-w-[140px]">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min={1}
                                                max={100}
                                                value={quantity}
                                                onChange={(event) => {
                                                    const next = Math.max(1, Math.min(100, Number.parseInt(event.target.value || '1', 10)));
                                                    setQuantity(Number.isFinite(next) ? next : 1);
                                                }}
                                                className="w-24 bg-transparent text-center text-4xl font-black text-gray-900 outline-none mx-auto block"
                                            />
                                            <span className="text-xs font-bold text-gray-400 uppercase">{t('nftLabel', 'NFT')}</span>
                                        </div>
                                        <button
                                            onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                            className="w-14 h-14 bg-gray-100 rounded-[16px] flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">{t('pricePerNft', 'Price per NFT')}</span>
                                        <span className="font-bold text-gray-900">${pricePerNFT.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">{t('quantity', 'Quantity')}</span>
                                        <span className="font-bold text-gray-900">{quantity}</span>
                                    </div>
                                    <div className="h-px bg-gray-200"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-bold text-gray-700">{t('totalCost', 'Total Cost')}</span>
                                        <span className="font-black text-2xl text-gray-900">${(pricePerNFT * quantity).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Confirm Button */}
                                <button onClick={() => setShowMintModal(false)} className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base rounded-[16px] shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all">
                                    {t('confirmMint', 'Confirm Mint')}
                                </button>

                                {/* Cancel Button */}
                                <button onClick={() => setShowMintModal(false)} className="w-full h-12 bg-gray-100 text-gray-600 font-bold text-base rounded-[16px] hover:bg-gray-200 active:scale-[0.98] transition-all">
                                    {t('cancel', 'Cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LayoutB>
    );
}
