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
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {t("map", "Your Team")}
        </h3>

        {path.length > 0 && (
          <button
            onClick={handleBackToTop}
            className="flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            {t("back", "Back")}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {levels.map((lvl) => (
          <div className="space-y-3" key={lvl.level}>
            <p className="text-[10px] font-bold uppercase text-gray-400 px-1 tracking-wider">
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
              <div className="space-y-3">
                {lvl.list.map((node) => (
                  <TeamCard
                    key={node.polyWalletID}
                    node={node}
                    clickable={node.team > 0}
                    onClick={() => handleSelectFromList(lvl.level, node)}
                  />
                ))}

                {lvl.list.length === 0 && (
                  <div className="text-sm text-gray-400">No members</div>
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
      className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-200 flex items-center gap-4"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.color}`}
      >
        <meta.icon size={20} fill="currentColor" className="opacity-80" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm">{node.polyWalletID}</h4>
        <span
          className={`text-[10px] font-black uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md mt-1 inline-block ${meta.badge}`}
        >
          {t(rankLabel, "") || "—"}
        </span>
      </div>
      <div className="flex gap-4 text-right">
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase">
            {t("own", "Own")}
          </span>
          <span className="block font-black text-blue-600 text-lg leading-tight">
            {node.nftAmount}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase">
            {t("teamLabel", "Team")}
          </span>
          <span className="block font-black text-green-600 text-lg leading-tight">
            {node.team}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamTreeUI;
