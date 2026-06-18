import { Badge } from '@/components/ui/Badge';
import type { ItineraryStatus } from '@/lib/api/models';

const STATUS_TONE = {
  DRAFT: 'info',
  CONFIRMED: 'success',
  CANCELLED: 'neutral',
} as const;

export function StatusBadge(props: { status: ItineraryStatus }) {
  return <Badge tone={STATUS_TONE[props.status]}>{props.status}</Badge>;
}

export function WithinBudgetBadge(props: { withinBudget: boolean }) {
  return (
    <Badge tone={props.withinBudget ? 'success' : 'danger'}>
      {props.withinBudget ? 'Within budget' : 'Over budget'}
    </Badge>
  );
}
