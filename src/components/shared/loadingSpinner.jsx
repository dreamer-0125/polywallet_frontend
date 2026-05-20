import { useContext } from "react";
import { LoadingContext } from "../../context/LoadingContext";

/**
 * @param {{ active?: boolean }} [props]
 * When `active` is a boolean, it controls visibility (e.g. `active` for route lazy-load).
 * When omitted, visibility follows LoadingContext (global async UI).
 */
const LoadingSpinner = ({ active }) => {
  const { loading } = useContext(LoadingContext);
  const visible = typeof active === "boolean" ? active : loading;

  return (
    <>
      {visible && (
        <div className="circular_progress">
          <svg className="w-44 h-44 animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="#2e6a71"
              strokeWidth="5"
              fill="none"
              opacity="0.4"
            />

            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="#42D0FA"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="80 220"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      )}
    </>
  );
};

export default LoadingSpinner;
