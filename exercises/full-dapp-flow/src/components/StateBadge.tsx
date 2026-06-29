import { FileEdit, CheckCircle2, Lock } from 'lucide-react';

type ProposalState = { draft: Record<string, never> } | { active: Record<string, never> } | { closed: Record<string, never> };

interface StateBadgeProps {
  state: ProposalState;
}

function resolveState(state: ProposalState): { label: string; icon: typeof FileEdit; colorClasses: string } {
  if ('draft' in state) {
    return { label: 'Draft', icon: FileEdit, colorClasses: 'bg-warning/15 text-warning border-warning/50' };
  }
  if ('active' in state) {
    return { label: 'Active', icon: CheckCircle2, colorClasses: 'bg-success/15 text-success border-success/50' };
  }
  // closed
  return { label: 'Closed', icon: Lock, colorClasses: 'bg-surface-2 text-muted border-border' };
}

export function StateBadge({ state }: StateBadgeProps) {
  const { label, icon: Icon, colorClasses } = resolveState(state);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
      role="status"
      aria-label={`Proposal status: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
