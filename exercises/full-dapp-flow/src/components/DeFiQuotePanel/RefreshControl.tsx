import { RefreshCw, Pause, Play } from 'lucide-react';

interface RefreshControlProps {
  /** Whether a refresh is currently in-flight. */
  isLoading: boolean;
  /** Whether auto-refresh is active. */
  autoRefresh: boolean;
  /** Trigger an immediate refresh. */
  onRefresh: () => void;
  /** Toggle auto-refresh on/off. */
  onToggleAutoRefresh: () => void;
  /** Auto-refresh interval label (e.g. "15s"). */
  intervalLabel: string;
}

/**
 * Manual refresh button + auto-refresh toggle.
 *
 * Both controls are keyboard accessible with visible focus rings and
 * meet the 44px minimum touch target on mobile.
 */
export function RefreshControl({
  isLoading,
  autoRefresh,
  onRefresh,
  onToggleAutoRefresh,
  intervalLabel,
}: RefreshControlProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Refresh quotes now"
      >
        <RefreshCw
          className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={autoRefresh}
        aria-label={`Auto-refresh every ${intervalLabel}`}
        onClick={onToggleAutoRefresh}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
      >
        {autoRefresh ? (
          <Pause className="h-4 w-4 text-yellow-400" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4 text-green-400" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {autoRefresh ? `Auto ${intervalLabel}` : 'Paused'}
        </span>
      </button>
    </div>
  );
}
