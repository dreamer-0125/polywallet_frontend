import { useMemo, useState } from "react";
import { useLocale } from "../../i18n";
import { ChevronLeft } from "lucide-react";
import { rankMeta } from "../../config/data.config";

const TeamTreeUI = ({ teamStructure }) => {
  const { t } = useLocale();
  // path = selected nodes per level (Level1 selection at index 0, Level2 at index 1, ...)
  const [path, setPath] = useState([]);

  const levels = useMemo(() => {
    const result = [];
    const rootChildren = (teamStructure && teamStructure.children) || [];

    // Initial: show Level 1 list (3 children)
    if (path.length === 0) {
      result.push({ level: 1, selected: null, list: rootChildren });
      return result;
    }

    // For each selected node, show it as the only card at that level
    for (let i = 0; i < path.length; i++) {
      result.push({ level: i + 1, selected: path[i], list: [] });
    }

    // Add the next level list (children of last selected)
    const last = path[path.length - 1];
    const nextChildren = (last && last.children) || [];
    if (nextChildren.length > 0) {
      result.push({
        level: path.length + 1,
        selected: null,
        list: nextChildren,
      });
    }

    return result;
  }, [path, teamStructure]);

  const handleSelectFromList = (level, node) => {
    // level is 1-based; selecting from that level list sets path up to (level-1) + node
    const next = path.slice(0, level - 1);
    next.push(node);
    setPath(next);
  };

  const handleBackToTop = () => {
    // Your requirement: back goes to the first state (Level1 shows all children)
    setPath((prev) => prev.slice(0, -1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">
            {t("network", "Network")}
          </span>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {t("map", "Your Team")}
          </h3>
        </div>

        {path.length > 0 && (
          <button
            onClick={handleBackToTop}
            className="flex items-center gap-1 text-xs font-bold text-blue-600"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            {t("back", "Back")}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {levels.map((lvl) => (
          <div className="space-y-2" key={lvl.level}>
            <p className="text-[9px] font-bold uppercase text-gray-400 px-1 tracking-[0.18em]">
              {t("level", "LEVEL")} {lvl.level}
            </p>

            {/* If selected exists, render only the selected card */}
            {lvl.selected ? (
              <TeamCard
                node={lvl.selected}
                clickable={false}
                onClick={() => {}}
              />
            ) : (
              <div className="space-y-2">
                {lvl.list.map((node) => (
                  <TeamCard
                    key={node.polyWalletID}
                    node={node}
                    clickable={node.team > 0}
                    onClick={() => handleSelectFromList(lvl.level, node)}
                  />
                ))}

                {lvl.list.length === 0 && (
                  <p className="text-[14px] text-gray-400 font-medium tracking-widest">{t("noMember", "")}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamCard = ({ node, onClick, clickable }) => {
  const { t } = useLocale();
  const rankLabel = ((node && node.rank) || "").trim();
  const meta = rankMeta[node.rank] || rankMeta["-"];

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className="relative w-full text-left bg-white p-3 rounded-[20px] shadow-[0_2px_10px_rgba(15,23,42,0.04)] border border-gray-200/80 flex items-center gap-3 overflow-hidden"
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-violet-500 to-cyan-400">
      </span>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.color} relative shrink-0`}
      >
        <meta.icon size={20} fill="currentColor" className="opacity-80" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-gray-900 text-sm tracking-tight truncate">{node.polyWalletID}</h4>
        <span
          className={`text-[10px] font-black uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md mt-1 inline-block ${meta.badge} text-amber-700`}
        >
          {t(rankLabel, "") || "—"}
        </span>
      </div>
      <div className="flex gap-2 text-right shrink-0">
        <div className="px-2 py-1 rounded-lg bg-blue-50/60 border border-blue-100">
          <span className="block text-[8px] text-blue-500/80 font-black uppercase tracking-[0.15em]">
            {t("own", "Own")}
          </span>
          <span className="block font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent text-base leading-tight tabular-nums">
            {node.nftAmount}
          </span>
        </div>
        <div className="px-2 py-1 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <span className="block text-[8px] text-emerald-600/80 font-black uppercase tracking-[0.15em]">
            {t("teamLabel", "Team")}
          </span>
          <span className="block font-black bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent text-base leading-tight tabular-nums">
            {node.team}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamTreeUI;
