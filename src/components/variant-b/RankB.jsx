import React, { useState } from 'react';
import LayoutB from './LayoutB';
import HeaderB from './HeaderB';
import { Crown, Users, TrendingUp, Copy, QrCode, Shield, Star, Award, Zap } from 'lucide-react';
import { useLocale } from '../../i18n';

export default function RankB() {
    const { t } = useLocale();
    const [showAllTeam, setShowAllTeam] = useState(false);
    const team = [
        { id: 'user1000', rank: 'Gold', team: '0', own: '4', color: 'text-yellow-600', icon: Award, bg: 'bg-yellow-50' },
        { id: 'user1001', rank: 'Diamond', team: '42', own: '4', color: 'text-blue-600', icon: Crown, bg: 'bg-blue-50' },
        { id: 'user1002', rank: 'Bronze', team: '47', own: '1', color: 'text-orange-700', icon: Shield, bg: 'bg-orange-50' },
    ];
    const visibleTeam = showAllTeam ? team : team.slice(0, 2);

    return (
        <LayoutB>
            <div className="px-6 pt-3 pb-4 space-y-4">
                <HeaderB title={t('rankTitle', 'Rank')} />

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Main Rank Card - Col Span 2 */}
                    <div className="col-span-2 bg-white p-6 rounded-[32px] shadow-[0_15px_30px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Crown size={120} />
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-[20px] bg-blue-50 flex items-center justify-center text-blue-600 animate-pulse-slow">
                                <Crown size={32} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('currentRank', 'Current Rank')}</p>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Diamond</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-[20px] hover:bg-gray-100 transition-colors">
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">{t('commission', 'Commission')}</p>
                                <p className="text-xl font-black text-green-600">15%</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-[20px] hover:bg-gray-100 transition-colors">
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">{t('pointBoost', 'Point Boost')}</p>
                                <p className="text-xl font-black text-blue-600">60%</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Bento Squares */}
                    <div className="bg-white p-4 rounded-[28px] shadow-[0_10px_20px_rgba(0,0,0,0.03)] border border-white hover:scale-[1.02] transition-transform flex flex-col justify-between h-36">
                        <div className="w-10 h-10 rounded-[12px] bg-purple-50 flex items-center justify-center text-purple-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('direct', 'Direct')}</p>
                            <p className="text-3xl font-black text-gray-900">3</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-[28px] shadow-[0_10px_20px_rgba(0,0,0,0.03)] border border-white hover:scale-[1.02] transition-transform flex flex-col justify-between h-36">
                        <div className="w-10 h-10 rounded-[12px] bg-pink-50 flex items-center justify-center text-pink-600">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('team', 'Team')}</p>
                            <p className="text-3xl font-black text-gray-900">156</p>
                        </div>
                    </div>

                    {/* Referral Link - Col Span 2 (Wide) */}
                    <div className="col-span-2 bg-gray-900 p-5 rounded-[28px] text-white shadow-xl flex items-center justify-between group cursor-pointer hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center">
                                <QrCode size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('referralLink', 'Referral Link')}</p>
                                <p className="text-sm font-bold text-white/90">polywallet.app/ref/usr000</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-[12px] bg-white text-gray-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Copy size={18} strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Team List Header */}
                    <div className="col-span-2 mt-4 flex items-center justify-between px-2">
                        <h3 className="text-base font-black text-gray-800">{t('recentJoiners', 'Recent Joiners')}</h3>
                        <button
                            type="button"
                            onClick={() => setShowAllTeam((prev) => !prev)}
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100"
                        >
                            {showAllTeam ? t('showLess', 'Show less') : t('viewAll', 'View All')}
                        </button>
                    </div>

                    {/* Team List Items (Full Width Bento Strips) */}
                    {visibleTeam.map((member, i) => (
                        <div key={i} className="col-span-2 bg-white p-4 rounded-[24px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center gap-4 hover:translate-x-1 transition-transform cursor-default">
                            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${member.bg}`}>
                                <member.icon size={18} className={member.color} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm">{member.id}</h4>
                                <span className={`text-[9px] font-black uppercase tracking-wider block mt-0.5 ${member.color} opacity-80`}>{member.rank}</span>
                            </div>
                            <div className="text-right pr-2">
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{t('teamLabel', 'Team')}</p>
                                <p className="text-sm font-black text-gray-900">{member.team}</p>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </LayoutB>
    );
}
