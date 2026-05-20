import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Diamond, Disc, Award } from 'lucide-react';
import clsx from 'clsx';
import { useLocale } from '../../i18n';

export default function LayoutA({ children }) {
    const location = useLocation();
    const path = location.pathname;
    const { t } = useLocale();

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to} className="flex flex-col items-center gap-1 group relative p-1 min-w-[64px]">
            <div className={clsx(
                "p-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                active
                    ? "bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-110 -translate-y-1"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            )}>
                {active && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
            </div>
            <span className={clsx(
                "text-[10px] font-bold transition-all duration-300",
                active ? "text-gray-900 translate-y-0 opacity-100" : "text-gray-400 translate-y-1 opacity-0 h-0 w-0 overflow-hidden"
            )}>
                {label}
            </span>
            {active && (
                <div className="absolute -bottom-2 w-1 h-1 bg-gray-900 rounded-full opacity-0"></div>
            )}
        </Link>
    );

    return (
        <div className="h-[100dvh] w-full bg-grid-dark text-gray-900 font-sans flex justify-center items-start sm:items-center selection:bg-gray-200 overflow-hidden">
            <div className="w-full h-full bg-[#F9FAFB] relative flex flex-col sm:h-[844px] sm:max-w-[400px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-gray-900 sm:ring-2 sm:ring-gray-700/50 sm:overflow-hidden transition-all duration-300">
                <main className="flex-1 overflow-y-auto pb-[120px] no-scrollbar relative">
                    {children}
                </main>

                {/* Bottom Nav - Floating Pill Style - FIXED TO BOTTOM */}
                <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center p-0 pointer-events-none">
                    <div className="bg-white/90 rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-6 py-3 flex justify-between items-end backdrop-blur-2xl border border-white/60 w-[90%] pointer-events-auto ring-1 ring-white/60">
                        <NavItem to="/soft-white/wallet" icon={Wallet} label={t('navWallet', 'Wallet')} active={path.includes('wallet')} />
                        <NavItem to="/soft-white/nft" icon={Disc} label={t('navNft', 'NFT')} active={path.includes('nft')} />
                        <NavItem to="/soft-white/point" icon={Diamond} label={t('navPoint', 'Point')} active={path.includes('point')} />
                        <NavItem to="/soft-white/rank" icon={Award} label={t('navRank', 'Rank')} active={path.includes('rank')} />
                    </div>
                </div>
            </div>
        </div>
    );
}
