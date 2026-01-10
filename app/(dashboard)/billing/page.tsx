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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Script from "next/script";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/jotai/user-atom";
import {
  PLANS,
  PLAN_ORDER,
  formatBytes,
  type BillingCycle,
  type PlanId,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (value?: unknown) => {
  if (!value) return "—";
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(parsed);
    }
  }
  if (typeof value === "object") {
    const asAny = value as { toDate?: () => Date; seconds?: number };
    if (typeof asAny.toDate === "function") {
      return formatDate(asAny.toDate());
    }
    if (typeof asAny.seconds === "number") {
      return formatDate(new Date(asAny.seconds * 1000));
    }
  }
  return "—";
};

const formatCurrency = (value?: number | null) => {
  if (!Number.isFinite(value ?? NaN)) return "—";
  return `Rp ${(value ?? 0).toLocaleString("id-ID")}`;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

export default function BillingPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR("/api/v2/billing", fetcher);
  const billing = data?.data;
  const [userSession] = useAtom(userAtom);
  const isAdmin = userSession?.role === "admin";

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [verifyOrderId, setVerifyOrderId] = useState("");
  const [verifyPlanId, setVerifyPlanId] = useState<PlanId>("starter");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(
    null,
  );
  const [latestOrderId, setLatestOrderId] = useState<string | null>(
    null,
  );

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

  const currentPlanId = (billing?.planId as PlanId) || "free";
  const availablePlanIds = useMemo<PlanId[]>(() => {
    if (currentPlanId === "pro") {
      return ["pro"];
    }
    if (currentPlanId !== "free") {
      return ["starter", "pro"];
    }
    return PLAN_ORDER;
  }, [currentPlanId]);
  const upgradeAmount = useMemo(() => {
    if (currentPlanId !== "starter") return null;
    const difference =
      cycle === "annual"
        ? PLANS.pro.annualPrice - PLANS.starter.annualPrice
        : PLANS.pro.monthlyPrice - PLANS.starter.monthlyPrice;
    return Math.max(0, difference);
  }, [currentPlanId, cycle]);

  const currentCycleLabel =
    billing?.billingCycle === "annual"
      ? "Annual"
      : billing?.billingCycle === "monthly"
        ? "Monthly"
        : "—";
  const currentPriceLabel =
    currentPlanId === "free"
      ? "Free"
      : billing?.billingCycle === "annual"
        ? `Rp ${currentPlan.annualPrice.toLocaleString("id-ID")}/yr`
        : `Rp ${currentPlan.monthlyPrice.toLocaleString("id-ID")}/mo`;
  const lastPaymentLabel = formatCurrency(billing?.lastPaymentAmount);
  const lastPaymentDate = formatDate(billing?.lastPaymentAt);
  const nextBillingLabel =
    currentPlanId === "free" ? "—" : formatDate(billing?.nextBillingAt);

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

  const handleCheckout = async (planId: PlanId) => {
    if (planId === "free") {
      await handlePlanChange(planId);
      return;
    }

    if (!window.snap) {
      toast({
        variant: "destructive",
        title: "Midtrans not ready",
        description: "Snap script is not loaded yet.",
        duration: 4000,
      });
      return;
    }

    try {
      setCheckoutLoading(planId);
      const response = await fetch("/api/payments/midtrans/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingCycle: cycle,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to create payment");
      }

      const snapToken = result?.data?.snapToken as string;
      const orderId = result?.data?.orderId as string;

      if (!snapToken) {
        throw new Error("Missing Snap token");
      }

      if (orderId) {
        setLatestOrderId(orderId);
        setVerifyOrderId(orderId);
        setVerifyPlanId(planId);
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          toast({
            variant: "success",
            title: "Payment completed",
            description: "Verifying your payment...",
            duration: 3000,
          });
          if (orderId) {
            await handleVerifyPayment(orderId, planId, cycle);
          }
        },
        onPending: () => {
          toast({
            title: "Payment pending",
            description: "Complete payment then verify it.",
            duration: 4000,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Payment failed",
            description: "Please try again.",
            duration: 4000,
          });
        },
        onClose: () => {
          toast({
            title: "Payment closed",
            description: "You can verify later with the order ID.",
            duration: 3000,
          });
        },
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleVerifyPayment = async (
    orderOverride?: string,
    planOverride?: PlanId,
    cycleOverride?: BillingCycle,
  ) => {
    const orderId = orderOverride ?? verifyOrderId.trim();
    const planId = planOverride ?? verifyPlanId;
    const selectedCycle = cycleOverride ?? cycle;
    if (!orderId) {
      toast({
        variant: "destructive",
        title: "Order ID required",
        description: "Enter the Midtrans order ID to verify.",
        duration: 3000,
      });
      return;
    }

    try {
      setVerifyLoading(true);
      const response = await fetch("/api/payments/midtrans/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          planId,
          billingCycle: selectedCycle,
        }),
      });

      const result = await response.json();
      if (response.status === 202) {
        toast({
          title: "Payment pending",
          description: result?.transaction_status || "Awaiting settlement.",
          duration: 4000,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(result?.message || "Verification failed");
      }

      toast({
        variant: "success",
        title: "Payment verified",
        description: "Your plan is updated.",
        duration: 3000,
      });
      if (!orderOverride) {
        setVerifyOrderId("");
      }
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="col-span-3 lg:col-span-4">
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <div className="min-h-screen px-4 py-8 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Billing</h2>
            <p className="text-sm text-muted-foreground">
              Mock membership plans for ad-free downloads and higher storage
              limits.
            </p>
          </div>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Plan details</CardTitle>
              <CardDescription>
                Current subscription information for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Tier
                </p>
                <p className="text-base font-semibold">
                  {currentPlan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentPriceLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Billing cycle
                </p>
                <p className="text-base font-semibold">
                  {currentCycleLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  Paid until {nextBillingLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Last payment
                </p>
                <p className="text-base font-semibold">
                  {lastPaymentLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastPaymentDate}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Status
                </p>
                <p className="text-base font-semibold">
                  {currentPlanId === "free" ? "Free plan" : "Active"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentPlan.adFree
                    ? "Ad-free downloads"
                    : "Downloads show ads"}
                </p>
              </div>
            </CardContent>
          </Card>

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
            {availablePlanIds.map((planId) => {
              const plan = PLANS[planId];
              const isUpgrade =
                currentPlanId === "starter" && planId === "pro";
              const displayUpgrade = isUpgrade && upgradeAmount !== null;
              const price =
                planId === "free"
                  ? "Free"
                  : displayUpgrade
                    ? `Upgrade Rp ${upgradeAmount?.toLocaleString(
                        "id-ID",
                      )}/${cycle === "annual" ? "yr" : "mo"}`
                    : cycle === "monthly"
                      ? `Rp ${plan.monthlyPrice.toLocaleString("id-ID")}/mo`
                      : `Rp ${plan.annualPrice.toLocaleString("id-ID")}/yr`;

              const isCurrent = currentPlanId === planId;
              const currentRank = PLAN_ORDER.indexOf(currentPlanId);
              const nextRank = PLAN_ORDER.indexOf(planId);
              const isDowngrade =
                !isAdmin && currentRank !== -1 && nextRank < currentRank;

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
                      onClick={() =>
                        isCurrent
                          ? undefined
                          : planId === "free"
                            ? handlePlanChange(planId)
                            : handleCheckout(planId)
                      }
                      disabled={
                        isLoading ||
                        checkoutLoading === planId ||
                        isCurrent ||
                        isDowngrade
                      }
                    >
                      {isCurrent
                        ? "Current plan"
                        : isDowngrade
                          ? "Downgrade blocked"
                          : planId === "free"
                            ? "Choose plan"
                            : checkoutLoading === planId
                              ? "Processing..."
                              : isUpgrade
                                ? "Upgrade now"
                                : "Pay now"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {isAdmin && (
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>Manual payment verification</CardTitle>
                <CardDescription>
                  Use this if Midtrans webhooks are not available yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestOrderId && (
                  <p className="text-xs text-muted-foreground">
                    Last order ID: {latestOrderId}
                  </p>
                )}
                <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
                  <Input
                    placeholder="Midtrans order ID"
                    value={verifyOrderId}
                    onChange={(event) => setVerifyOrderId(event.target.value)}
                  />
                  <Select
                    value={verifyPlanId}
                    onValueChange={(value) =>
                      setVerifyPlanId(value as PlanId)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={cycle}
                    onValueChange={(value) =>
                      setCycle(value as BillingCycle)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Make sure the plan and billing cycle match the payment.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleVerifyPayment()}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? "Verifying..." : "Verify payment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
