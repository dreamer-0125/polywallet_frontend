import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Wallet, Diamond, Disc, Award, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { useLocale } from '../../i18n';
import lumaBg from '../../assets/Luma2016.jpeg';
import LogoBlack from '../../assets/LOGO-black.svg';

export default function LayoutADesktop({ children }) {
    const { t } = useLocale();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        try {
            return window.localStorage.getItem('pw-desktop-sidebar') === 'collapsed';
        } catch (error) {
            return false;
        }
    });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem('pw-desktop-sidebar', collapsed ? 'collapsed' : 'expanded');
            } catch (error) {
                // ignore storage errors
            }
        }
    }, [collapsed]);

    // Responsive Guard: Redirect to Mobile if screen is too small (< 768px)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Redirect to mobile wallet if screen shrinks
                // Using window.location to ensure clean state or useNavigate
                // But since we are inside Router, use navigate.
                // We need to import navigate first.
            }
        };

        // Check on mount
        if (window.innerWidth < 768) {
            // We can't use navigate here easily without the hook.
            // Let's add the hook.
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Better implementation with Hook:
    const navigate = useNavigate();
    useEffect(() => {
        const checkSize = () => {
            if (window.innerWidth < 768) {
                navigate('/soft-white/wallet', { replace: true });
            }
        };

        checkSize(); // Check on mount
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, [navigate]);

    const navItems = [
        { to: '/desktop/wallet', icon: Wallet, label: t('navWallet', 'Wallet') },
        { to: '/desktop/nft', icon: Disc, label: t('navNft', 'NFT') },
        { to: '/desktop/point', icon: Diamond, label: t('navPoint', 'Point') },
        { to: '/desktop/rank', icon: Award, label: t('navRank', 'Rank') },
    ];

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans flex justify-center items-center p-6 bg-[#F2F4F7]">
            {/* Background: LightGlow - 08 style Gradient (50% opacity) */}
            {/* Background: Luma Effect Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src={lumaBg}
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
            </div>

            {/* Mouse Spotlight Effect */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.8), transparent 40%)`
                }}
            ></div>

            {/* 8px Glass Border Wrapper */}
            <div className="relative z-10 w-full max-w-[1440px] h-[calc(100vh-48px)] bg-white/40 backdrop-blur-xl rounded-[32px] p-[8px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60">

                {/* Main Glass/White Container */}
                <div className="w-full h-full bg-white/80 rounded-[24px] overflow-hidden flex shadow-inner relative z-10">
                    <aside
                        className={clsx(
                            'bg-white/50 backdrop-blur-md border-r border-[#E4E9F0] flex flex-col transition-all duration-300',
                            collapsed ? 'w-20' : 'w-64'
                        )}
                    >
                        <div className="flex items-center justify-between px-6 py-6 h-20">
                            {/* Logo Section */}
                            {!collapsed ? (
                                <img src={LogoBlack} alt="PolyWallet" className="h-5 w-auto" />
                            ) : (
                                <div className="w-full flex justify-center">
                                    <img src={LogoBlack} alt="PW" className="h-5 w-auto" />
                                </div>
                            )}

                            {!collapsed && (
                                <button
                                    type="button"
                                    onClick={() => setCollapsed(true)}
                                    className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors border border-gray-100 shadow-sm"
                                    aria-label="Collapse sidebar"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                        </div>

                        {collapsed && (
                            <div className="flex justify-center mb-6">
                                <button
                                    type="button"
                                    onClick={() => setCollapsed(false)}
                                    className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors border border-gray-100 shadow-sm rotate-180"
                                    aria-label="Expand sidebar"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            </div>
                        )}

                        <nav className="flex-1 px-3 space-y-2 py-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-3 px-3 py-3 rounded-[16px] transition-all duration-200 group',
                                            isActive
                                                ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/10'
                                                : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                        )
                                    }
                                >
                                    <div className={clsx(
                                        'rounded-xl p-0.5 transition-colors',
                                        // isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                                    )}>
                                        <item.icon size={20} strokeWidth={2} />
                                    </div>
                                    {!collapsed && <span className="font-semibold text-[15px]">{item.label}</span>}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Profile / Footer - Removed as per request */}
                    </aside>

                    <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FAFAFA]/50">
                        {/* Reduced padding from p-8 to p-5 to reduce gaps from sidebar */}
                        <div className="max-w-5xl mx-auto p-5 pb-24">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
