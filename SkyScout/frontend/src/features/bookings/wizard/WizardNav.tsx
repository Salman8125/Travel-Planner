import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface WizardNavProps {
  onNext?: () => void;
  onBack?: () => void;
  backTo?: string;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  hideNext?: boolean;
}

export function WizardNav({
  onNext,
  onBack,
  backTo,
  nextLabel = "Continue",
  backLabel = "Back",
  nextDisabled,
  nextLoading,
  hideNext,
}: WizardNavProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else if (backTo) navigate(backTo);
  };

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button type="button" variant="ghost" onClick={handleBack}>
        {backLabel}
      </Button>
      {!hideNext && (
        <Button type="button" onClick={onNext} disabled={nextDisabled} loading={nextLoading}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
