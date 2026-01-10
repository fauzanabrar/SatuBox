"use client";

import { useSWRUser } from "@/hooks/useSWRUser";
import Loading from "../loading";
import { User } from "@/types/userTypes";
import { useState } from "react";
import { Button } from "../ui/button";
import { UserSession } from "@/types/api/auth";
import dynamic from "next/dynamic";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PLANS, type PlanId } from "@/lib/billing/plans";

const DialogDeleteUser = dynamic(() => import("./dialog-delete"), {
  ssr: false,
});

const DialogEditUser = dynamic(() => import("./dialog-edit"), { ssr: false });

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

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function ListUser({
  userSession,
}: {
  userSession: UserSession;
}) {
  const [loading, setLoading] = useState(false);

  const { data, error, isLoading, mutate } = useSWRUser(setLoading);

  if (isLoading && !data)
    return (
      <div className="mt-8 flex w-full justify-center">
        <Loading size={60} loading={isLoading} />
      </div>
    );

  if (error)
    return (
      <div className="mt-2 flex w-full justify-center text-lg font-semibold text-destructive">
        Failed to load users!
      </div>
    );

  return (
    <div className="max-w-5xl">
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[260px]">User</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[170px]">Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[180px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((user: User) => {
              const planId = (user.planId as PlanId) ?? "free";
              const plan = PLANS[planId] ?? PLANS.free;
              const cycleLabel =
                user.billingCycle === "annual"
                  ? "Annual"
                  : user.billingCycle === "monthly"
                    ? "Monthly"
                    : "—";
              const nextBillingLabel =
                planId === "free" ? "—" : formatDate(user.nextBillingAt);
              const lastPaymentLabel = formatCurrency(user.lastPaymentAmount);
              const lastPaymentDate = formatDate(user.lastPaymentAt);
              const hasPaymentHistory = Boolean(
                user.lastPaymentAt ||
                  user.lastPaymentAmount ||
                  user.lastPaymentOrderId,
              );
              const planVariant =
                planId === "pro"
                  ? "default"
                  : planId === "starter"
                    ? "secondary"
                    : "outline";
              const roleVariant =
                user.role === "admin" ? "default" : "secondary";

              return (
                <TableRow key={user.username}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={planVariant}>{plan.name}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {cycleLabel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Paid until: {nextBillingLabel}</p>
                      <p>
                        Last payment:{" "}
                        {hasPaymentHistory
                          ? `${lastPaymentLabel} · ${lastPaymentDate}`
                          : "—"}
                      </p>
                      {user.lastPaymentOrderId && (
                        <p>Order: {user.lastPaymentOrderId}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DialogEditUser user={user} mutate={mutate}>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          disabled={user.username === userSession.username}
                        >
                          Edit
                        </Button>
                      </DialogEditUser>
                      <DialogDeleteUser user={user} mutate={mutate}>
                        <Button
                          variant={"destructive"}
                          size={"sm"}
                          disabled={user.username === userSession.username}
                        >
                          Delete
                        </Button>
                      </DialogDeleteUser>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
