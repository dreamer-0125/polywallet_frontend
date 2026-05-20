import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Diamond, Disc, Award } from 'lucide-react';
import clsx from 'clsx';

export default function LayoutB({ children }) {
    const location = useLocation();
    const path = location.pathname;

    const NavItem = ({ to, icon: Icon, active }) => (
        <Link to={to} className="flex flex-col items-center justify-center gap-1 group relative w-12 h-12">
            <div className={clsx(
                "absolute inset-0 rounded-[18px] transition-all duration-300",
                active
                    ? "bg-gray-900 shadow-lg scale-100"
                    : "hover:bg-gray-50 scale-90"
            )} />
            <Icon size={24} className={clsx("z-10 transition-colors duration-300", active ? "text-white" : "text-gray-400")} strokeWidth={active ? 2.5 : 2} />
        </Link>
    );

    return (
        <div className="h-[100dvh] w-full relative overflow-hidden flex justify-center items-start sm:items-center font-sans tracking-tight">
            {/* Animated Background Layers - Matching Amplemarket vibe */}
            <div className="absolute inset-0 bg-[#F2F4F7]"></div>

            {/* Soft huge gradient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

            {/* Dashboard Container - Glass Effect */}
            <div className="relative w-full h-full sm:h-[844px] sm:max-w-[400px] z-10">

                {/* 8px Glass Border Wrapper */}
                <div className="w-full h-full sm:rounded-[48px] p-[8px] bg-white/40 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60">

                    {/* Inner Content Area */}
                    <div className="w-full h-full bg-white sm:rounded-[40px] relative overflow-hidden flex flex-col shadow-inner">
                        <main className="flex-1 overflow-y-auto pb-[100px] no-scrollbar relative z-10 bg-gradient-to-b from-[#F9FAFB] to-[#FFFFFF]">
                            {children}
                        </main>

                        {/* Bottom Nav - Clean Docked */}
                        <div className="absolute bottom-0 left-0 right-0 z-50">
                            {/* Subtle glass gradient for footer blending */}
                            <div className="h-12 bg-gradient-to-t from-white to-transparent pointer-events-none absolute -top-12 inset-x-0"></div>

                            <div className="bg-white px-8 py-5 flex justify-between items-center border-t border-gray-50 pb-8 sm:pb-6">
                                <NavItem to="/neumorph/wallet" icon={Wallet} label="" active={path.includes('wallet')} />
                                <NavItem to="/neumorph/nft" icon={Disc} label="" active={path.includes('nft')} />
                                <NavItem to="/neumorph/point" icon={Diamond} label="" active={path.includes('point')} />
                                <NavItem to="/neumorph/rank" icon={Award} label="" active={path.includes('rank')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
