"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  PLANS,
  PLAN_ORDER,
  formatBytes,
  type BillingCycle,
  type PlanId,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BillingPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR("/api/v2/billing", fetcher);
  const billing = data?.data;

  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    if (
      billing?.billingCycle === "monthly" ||
      billing?.billingCycle === "annual"
    ) {
      setCycle(billing.billingCycle);
    }
  }, [billing?.billingCycle]);

  const currentPlan =
    (billing?.planId as PlanId) && PLANS[billing.planId as PlanId]
      ? PLANS[billing.planId as PlanId]
      : PLANS.free;

  const usagePercent = useMemo(() => {
    const used = billing?.storageUsedBytes ?? 0;
    const limit = billing?.storageLimitBytes ?? 0;
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }, [billing?.storageUsedBytes, billing?.storageLimitBytes]);

  const handlePlanChange = async (planId: PlanId) => {
    try {
      const response = await fetch("/api/v2/billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingCycle: planId === "free" ? null : cycle,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to update plan");
      }

      toast({
        variant: "success",
        title: "Plan updated",
        description: "This is a mock checkout flow.",
        duration: 3000,
      });
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Plan update failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    }
  };

  const currentPlanId = (billing?.planId as PlanId) || "free";

  return (
    <div className="col-span-3 lg:col-span-4">
      <div className="h-full px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Billing</h2>
            <p className="text-sm text-muted-foreground">
              Mock membership plans for ad-free downloads and higher storage
              limits.
            </p>
          </div>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Storage usage</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading usage..."
                  : `${formatBytes(billing?.storageUsedBytes)} of ${formatBytes(
                      billing?.storageLimitBytes ??
                        currentPlan.storageLimitBytes,
                    )} used`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={usagePercent} />
              <p className="mt-2 text-xs text-muted-foreground">
                Usage updates after uploads and deletes.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              variant={cycle === "monthly" ? "default" : "outline"}
              onClick={() => setCycle("monthly")}
              disabled={isLoading}
            >
              Monthly
            </Button>
            <Button
              variant={cycle === "annual" ? "default" : "outline"}
              onClick={() => setCycle("annual")}
              disabled={isLoading}
            >
              Annual
            </Button>
            <span className="text-xs text-muted-foreground">
              Annual plans save 2 months.
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const price =
                planId === "free"
                  ? "Free"
                  : cycle === "monthly"
                    ? `$${plan.monthlyPrice}/mo`
                    : `$${plan.annualPrice}/yr`;

              const isCurrent = currentPlanId === planId;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "flex h-full flex-col",
                    isCurrent ? "border-primary" : "",
                  )}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div>
                      <p className="text-2xl font-semibold">{price}</p>
                      <p className="text-xs text-muted-foreground">
                        Storage up to {plan.storageLabel}
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Public share links</li>
                      <li>
                        {plan.adFree
                          ? "Ad-free downloads"
                          : "Downloads show ads"}
                      </li>
                      <li>{plan.storageLabel} total storage</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : "default"}
                      onClick={() => handlePlanChange(planId)}
                      disabled={isLoading}
                    >
                      {isCurrent ? "Current plan" : "Choose plan"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
