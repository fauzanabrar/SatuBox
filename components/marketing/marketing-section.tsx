import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MarketingSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function MarketingSection({
  title,
  children,
  className,
}: MarketingSectionProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold sm:text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
