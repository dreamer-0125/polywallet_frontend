import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, ChevronDown, Wallet, Power, Check } from 'lucide-react';
import { useLocale, languageOptions } from '../../i18n';
import Logo from '../../assets/LOGO.svg';
import { useAuth } from '../../context/AuthContext';

export default function HeaderB({ title = "PolyWallet" }) {
    const navigate = useNavigate();
    const { t, locale, setLocale } = useLocale();
    const { user, logout } = useAuth();
    const [showWalletMenu, setShowWalletMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const menuRef = useRef(null);
    const walletAddress = user?.walletAddress || '0x742d...5f3A';

    useEffect(() => {
        const handleClick = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setShowWalletMenu(false);
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggleWallet = () => {
        setShowWalletMenu((prev) => !prev);
        setShowLangMenu(false);
    };

    const toggleLanguage = () => {
        setShowLangMenu((prev) => !prev);
        setShowWalletMenu(false);
    };

    return (
        <div className="flex justify-between items-center px-1 mb-3">
            {/* Logo Section replacing Greeting/Title */}
            <div className="flex items-center">
                <img src={Logo} alt="PolyWallet Logo" className="h-8 w-auto text-black" />
            </div>

            <div ref={menuRef} className="relative flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleLanguage}
                    aria-label={t('language', 'Language')}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                >
                    <Globe size={18} strokeWidth={2} />
                </button>

                {/* Wallet Address Display replacing Avatar */}
                <button
                    type="button"
                    onClick={toggleWallet}
                    className="bg-[#1A1D1F] text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-md text-xs font-bold tracking-wide"
                >
                    <span>{walletAddress}</span>
                    <ChevronDown size={14} className="opacity-50" />
                </button>

                {showWalletMenu && (
                    <div className="absolute right-0 top-14 z-50 w-64 rounded-[18px] bg-[#111827] text-white shadow-2xl border border-white/10 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-xs text-white/60 font-bold uppercase tracking-wider">{t('connectedWallet', 'Connected Wallet')}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Wallet size={16} />
                                </div>
                                <span>{walletAddress}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setShowWalletMenu(false);
                                logout();
                                navigate('/');
                            }}
                            className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold text-red-400 hover:bg-white/5 transition-colors"
                        >
                            <Power size={16} />
                            {t('disconnect', 'Disconnect')}
                        </button>
                    </div>
                )}

                {showLangMenu && (
                    <div className="absolute right-0 top-14 z-50 w-60 rounded-[18px] bg-[#111827] text-white shadow-2xl border border-white/10 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-xs text-white/60 font-bold uppercase tracking-wider">{t('language', 'Language')}</p>
                        </div>
                        <div className="py-2">
                            {languageOptions.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => setLocale(language.code)}
                                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{language.label}</p>
                                        <p className="text-xs text-white/50">{language.native}</p>
                                    </div>
                                    {locale === language.code && <Check size={16} className="text-green-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
