import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type Props = {
  periodDiyanet: "Mekke" | "Medine";
  periodOkuyan: "Mekke" | "Medine";
  disputeNote?: string | null;
  className?: string;
};

/**
 * Shows the revelation period. When Diyanet and Okuyan disagree we never pick a
 * winner — both are displayed with an explanatory tooltip, because the
 * disagreement itself is information the reader needs.
 */
export default function PeriodBadge({
  periodDiyanet,
  periodOkuyan,
  disputeNote,
  className,
}: Props) {
  const disputed = periodDiyanet !== periodOkuyan;

  if (!disputed) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-border/80 bg-secondary/60 font-medium text-secondary-foreground",
          className,
        )}>
        {periodDiyanet}
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-help gap-1 border-accent-foreground/35 bg-accent/40 font-medium text-accent-foreground",
            className,
          )}>
          <AlertCircle className="size-3" />
          İhtilaflı
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs space-y-1.5 text-left">
        <p className="font-medium">Nüzul dönemi ihtilaflı</p>
        <p className="text-xs leading-relaxed">
          Diyanet: <strong>{periodDiyanet}</strong> · Okuyan: <strong>{periodOkuyan}</strong>
        </p>
        {disputeNote && <p className="text-xs leading-relaxed opacity-90">{disputeNote}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

