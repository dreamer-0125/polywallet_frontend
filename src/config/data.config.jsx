import {
  Star,
  Shield,
  AnchorIcon,
  Cannabis,
  Sparkles,
  Gem,
  Zap,
} from "lucide-react";

/** Rank rates (bonusRate, pointApy) come from GET /user/wallet-config via useWalletConfig(). */

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
