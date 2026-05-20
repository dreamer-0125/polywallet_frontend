import React from 'react';
import LayoutB from './LayoutB';
import HeaderB from './HeaderB';
import { Sparkles, TrendingUp, Target, BarChart3, Gamepad2, MessageCircle, ChevronRight, Zap, Trophy } from 'lucide-react';
import { useLocale } from '../../i18n';

export default function PointB() {
    const { t } = useLocale();
    const projects = [
        { name: 'Polymarket', points: '15 420', change: '+564', icon: Target, color: 'text-blue-600', iconBg: 'bg-blue-50' },
        { name: 'Probable', points: '8 934', change: '+413', icon: BarChart3, color: 'text-green-600', iconBg: 'bg-green-50' },
        { name: 'Predict Fun', points: '12 567', change: '+778', icon: Gamepad2, color: 'text-purple-600', iconBg: 'bg-purple-50' },
        { name: 'OPINION', points: 'Coming Soon', change: '', icon: MessageCircle, color: 'text-gray-400', iconBg: 'bg-gray-50', disabled: true },
    ];

    return (
        <LayoutB>
            <div className="px-6 pt-3 pb-4 space-y-4">
                <HeaderB title={t('pointsTitle', 'Points')} />

                {/* Bento Grid */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Hero Card - Col Span 2 */}
                    {/* Hero Card - Clean White Puffy (No Colors) */}
                    <div className="col-span-2 bg-white p-8 rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] text-center relative overflow-hidden group border border-gray-100">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{t('totalPoints', 'Total Points')}</p>
                            <h2 className="text-[52px] font-black text-gray-900 tracking-tight leading-none mb-6">125 840</h2>

                            <button className="bg-gray-50 px-6 py-2.5 rounded-full border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2 shadow-sm">
                                <Trophy size={14} className="text-yellow-600" />
                                <span>{t('viewLeaderboard', 'View Leaderboard')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Small Bento Cards */}
                    <div className="bg-white p-4 rounded-[26px] shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-white hover:translate-y-[-2px] transition-transform">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-3">
                            <TrendingUp size={16} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{t('yesterday', 'yesterday')}</p>
                        <p className="text-xl font-black text-gray-900">+1 234</p>
                    </div>

                    <div className="bg-white p-4 rounded-[26px] shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-white hover:translate-y-[-2px] transition-transform">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{t('totalBoost', 'Total Boost')}</p>
                        <p className="text-xl font-black text-gray-900">50%</p>
                    </div>

                    {/* Projects Header */}
                    <div className="col-span-2 mt-4 px-2">
                        <h3 className="text-base font-black text-gray-800">{t('myProjects', 'My Projects')}</h3>
                    </div>

                    {/* Projects Grid - Using Col Span 2 for larger feel, or 1 for compact? Let's use 2 for clarity */}
                    {projects.map((p, i) => (
                        <div key={i} className={`col-span-2 p-4 rounded-[24px] flex items-center gap-4 transition-all duration-300 group ${p.disabled ? 'opacity-60 border border-gray-200 border-dashed bg-transparent' : 'bg-white shadow-[0_8px_25px_-5px_rgba(0,0,0,0.04)] border border-gray-50 hover:scale-[1.01]'}`}>

                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 ${p.disabled ? 'bg-gray-100' : p.iconBg} group-hover:scale-110 transition-transform`}>
                                <p.icon size={22} className={p.color} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{p.name}</h4>
                                {!p.disabled && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 rounded-[4px]">{p.change}</span>
                                        <span className="text-[10px] font-bold text-gray-400">{t('pointsTrend', 'pts trend')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                {p.disabled ? (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-400 rounded-lg">{t('soon', 'Soon')}</span>
                                ) : (
                                    <div className="text-lg font-black text-gray-900 tracking-tight">{p.points}</div>
                                )}
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </LayoutB>
    );
}
