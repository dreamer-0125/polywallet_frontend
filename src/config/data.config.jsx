import {
  Star,
  Shield,
  AnchorIcon,
  Cannabis,
  Sparkles,
  Gem,
  Zap,
} from "lucide-react";

export const RankData = {
  JPManager: {
    bonusRate: 0.5,
    bonusLevel: 1000000000,
    pointApy: 0.6,
  },
  Special: {
    bonusRate: 0.45,
    bonusLevel: 7, // only referral bonus till the level 6
    pointApy: 0.6,
  },
  Diamond: {
    bonusRate: 0.4,
    bonusLevel: 6, // only referral bonus till the level 6
    pointApy: 0.6,
  },
  Black: {
    bonusRate: 0.35,
    bonusLevel: 5,
    pointApy: 0.5,
  },
  Platinum: {
    bonusRate: 0.3,
    bonusLevel: 4,
    pointApy: 0.4,
  },
  Gold: {
    bonusRate: 0.25,
    bonusLevel: 3,
    pointApy: 0.3,
  },
  Silver: {
    bonusRate: 0.2,
    bonusLevel: 2,
    pointApy: 0.2,
  },
  Bronze: {
    bonusRate: 0.1,
    bonusLevel: 1,
    pointApy: 0.1,
  },
  "": {
    bonusRate: 0,
    bonusLevel: 0,
    pointApy: 0,
  },
};

const NoRankIcon = () => {
  return <span className="text-gray-500 font-bold">◆</span>;
};

export const rankMeta = {
  "-": {
    color: "bg-gray-100 text-gray-700",
    badge: "text-gray-700",
    icon: NoRankIcon,
  },
  Bronze: {
    color: "bg-orange-100 text-orange-700",
    badge: "text-orange-700",
    icon: Shield,
  },
  Silver: {
    color: "bg-emerald-100 text-emerald-700",
    badge: "text-emerald-700",
    icon: AnchorIcon,
  },
  Gold: {
    color: "bg-yellow-100 text-yellow-700",
    badge: "text-yellow-700",
    icon: Star,
  },
  Platinum: {
    color: "bg-violet-100 text-violet-700",
    badge: "text-violet-700",
    icon: Sparkles,
  },
  Black: {
    color: "bg-slate-100 text-slate-700",
    badge: "text-slate-700",
    icon: Cannabis,
  },
  Diamond: {
    color: "bg-blue-100 text-blue-700",
    badge: "text-blue-600",
    icon: Gem,
  },
  Special: {
    color: "bg-pink-100 text-pink-700",
    badge: "text-pink-600",
    icon: Zap,
  },
};
