import { PageHeader } from '@/components/common/PageHeader';
import { BuilderShell } from '@/features/builder/components/BuilderShell';

export default function BuilderPage() {
  return (
    <div class="mx-auto max-w-4xl">
      <PageHeader
        title="Build a trip"
        subtitle="Provide the chosen flight, hotel, weather and budget. TripWeaver assembles the day-by-day plan."
      />
      <BuilderShell />
    </div>
  );
}
