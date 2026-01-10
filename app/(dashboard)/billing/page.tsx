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
import {
  PLANS,
  PLAN_ORDER,
  formatBytes,
  type BillingCycle,
  type PlanId,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
        onSuccess: () => {
          toast({
            variant: "success",
            title: "Payment completed",
            description: "Use Verify Payment if plan does not update.",
            duration: 4000,
          });
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

  const handleVerifyPayment = async () => {
    const orderId = verifyOrderId.trim();
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
          planId: verifyPlanId,
          billingCycle: cycle,
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
      setVerifyOrderId("");
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

  const currentPlanId = (billing?.planId as PlanId) || "free";

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
                    ? `Rp ${plan.monthlyPrice.toLocaleString("id-ID")}/mo`
                    : `Rp ${plan.annualPrice.toLocaleString("id-ID")}/yr`;

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
                      onClick={() =>
                        isCurrent
                          ? undefined
                          : planId === "free"
                            ? handlePlanChange(planId)
                            : handleCheckout(planId)
                      }
                      disabled={
                        isLoading || checkoutLoading === planId || isCurrent
                      }
                    >
                      {isCurrent
                        ? "Current plan"
                        : planId === "free"
                          ? "Choose plan"
                          : checkoutLoading === planId
                            ? "Processing..."
                            : "Pay with Midtrans"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

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
                  onClick={handleVerifyPayment}
                  disabled={verifyLoading}
                >
                  {verifyLoading ? "Verifying..." : "Verify payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
