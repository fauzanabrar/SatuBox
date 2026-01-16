"use client";
import { DialogClose } from "@/components/ui/dialog";
import { useEffect } from "react";
import Loading from "@/components/loading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { capitalize } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import Switch from "./switch";
import Match from "./match";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PLANS, type BillingCycle, type PlanId } from "@/lib/billing/plans";
import { formatCurrency } from "@/lib/formatters/currency";

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  oldUsername: z.string(),
  role: z.string(),
  planId: z.string().optional(),
  billingCycle: z.string().optional(),
  nextBillingAt: z.string().optional(),
});

const toDateInputValue = (value?: unknown) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  if (typeof value === "object") {
    const asAny = value as { toDate?: () => Date; seconds?: number };
    if (typeof asAny.toDate === "function") {
      return toDateInputValue(asAny.toDate());
    }
    if (typeof asAny.seconds === "number") {
      return toDateInputValue(new Date(asAny.seconds * 1000));
    }
  }
  return "";
};

export default function FormEditProfile({
  user,
  open,
  setOpen,
  loading,
  setLoading,
  mutate,
  hidden = [],
}: {
  user: any;
  open: boolean;
  setOpen: any;
  loading: boolean;
  setLoading: any;
  mutate: any;
  hidden?: string[];
}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      oldUsername: user.username,
      role: user.role,
      planId: user.planId ?? "free",
      billingCycle: user.billingCycle ?? "monthly",
      nextBillingAt: toDateInputValue(user.nextBillingAt),
    },
  });

  const cycleValue = form.watch("billingCycle");
  const selectedCycle: BillingCycle =
    cycleValue === "annual" || cycleValue === "monthly"
      ? (cycleValue as BillingCycle)
      : "monthly";
  const currentPlanId = (user.planId as PlanId) ?? "free";
  const upgradePrice =
    selectedCycle === "annual"
      ? PLANS.pro.annualPrice - PLANS.starter.annualPrice
      : PLANS.pro.monthlyPrice - PLANS.starter.monthlyPrice;
  const proUpgradeLabel =
    currentPlanId === "starter"
      ? `Pro (upgrade +${formatCurrency(Math.max(0, upgradePrice))}/${selectedCycle === "annual" ? "yr" : "mo"})`
      : "Pro";
  const planOptions =
    currentPlanId === "pro"
      ? [{ value: "pro", label: "Pro" }]
      : currentPlanId === "starter"
        ? [
            { value: "starter", label: "Starter" },
            { value: "pro", label: proUpgradeLabel },
          ]
        : [
            { value: "free", label: "Free" },
            { value: "starter", label: "Starter" },
            { value: "pro", label: "Pro" },
          ];

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        username: user.username,
        oldUsername: user.username,
        role: user.role,
        planId: user.planId ?? "free",
        billingCycle: user.billingCycle ?? "monthly",
        nextBillingAt: toDateInputValue(user.nextBillingAt),
      });
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Something went wrong`);
      }

      mutate();
      toast({
        variant: "success",
        title: "Success edit user!",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error edit user!",
        description: error.message || "An unexpected error occurred",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          {Object.entries(formSchema.shape)
            .filter((schema) => !hidden.includes(schema[0]) && schema[0] !== "oldUsername")
            .map(([fieldName, _]) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof typeof formSchema.shape} // Cast the fieldName to the specific keys defined in formSchema.shape
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName === "nextBillingAt"
                        ? "Paid until"
                        : capitalize(fieldName)}
                    </FormLabel>
                    <FormControl>
                      <Switch>
                        <Match when={fieldName === "role"}>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </Match>
                        <Match when={fieldName === "planId"}>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={planOptions.length === 1}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {planOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Match>
                        <Match when={fieldName === "billingCycle"}>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        </Match>
                        <Match when={fieldName === "nextBillingAt"}>
                          <Input type="date" {...field} />
                        </Match>
                        <Match
                          when={
                            fieldName !== "role" &&
                            fieldName !== "planId" &&
                            fieldName !== "billingCycle" &&
                            fieldName !== "nextBillingAt"
                          }
                        >
                          <Input {...field} />
                        </Match>
                      </Switch>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          <div className="flex justify-end gap-2 pt-4 ">
            <Button
              variant="default"
              className="flex px-4"
              type="submit"
              disabled={loading}
            >
              <Loading loading={loading} size={20} className="-ml-2 mr-2" />
              {loading ? "Saving..." : "Edit"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </Form>
    </div>
  );
}
