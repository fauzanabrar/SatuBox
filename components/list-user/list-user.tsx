"use client";

import { useSWRUser } from "@/hooks/useSWRUser";
import Loading from "../loading";
import { User } from "@/types/userTypes";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { UserSession } from "@/types/api/auth";
import dynamic from "next/dynamic";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
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

const formatDateTime = (value?: unknown) => {
  if (!value) return "—";
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(parsed);
    }
  }
  if (typeof value === "object") {
    const asAny = value as { toDate?: () => Date; seconds?: number };
    if (typeof asAny.toDate === "function") {
      return formatDateTime(asAny.toDate());
    }
    if (typeof asAny.seconds === "number") {
      return formatDateTime(new Date(asAny.seconds * 1000));
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
  const [query, setQuery] = useState("");

  const { data, error, isLoading, mutate } = useSWRUser(setLoading);
  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter((user: User) => {
      const planId = (user.planId as PlanId) ?? "free";
      const plan = PLANS[planId] ?? PLANS.free;
      const haystack = [
        user.name,
        user.username,
        user.role,
        planId,
        plan.name,
        user.billingCycle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [data, query]);

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

  const totalUsers = data?.length ?? 0;
  const shownUsers = filteredUsers.length;
  const showFilteredCount = query.trim().length > 0;

  return (
    <div className="mt-6 max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">All users</p>
          <p className="text-xs text-muted-foreground">
            Manage roles, plan, and billing status.
          </p>
        </div>
        <div className="flex w-full flex-1 flex-wrap items-center justify-end gap-3 sm:w-auto">
          <div className="text-xs font-medium text-muted-foreground">
            {showFilteredCount
              ? `Showing ${shownUsers} of ${totalUsers}`
              : `Total users: ${totalUsers}`}
          </div>
          <div className="w-full sm:w-64">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, username, role..."
              aria-label="Search users"
            />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[260px] px-4 py-3">User</TableHead>
              <TableHead className="w-[120px] px-4 py-3">Role</TableHead>
              <TableHead className="w-[170px] px-4 py-3">Tier</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="w-[180px] px-4 py-3 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: User) => {
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
              const lastPaymentDate = formatDateTime(user.lastPaymentAt);
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
                <TableRow key={user.username} className="hover:bg-muted/30">
                  <TableCell className="px-4 py-4">
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
                  <TableCell className="px-4 py-4">
                    <Badge variant={roleVariant}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="space-y-1">
                      <Badge variant={planVariant}>{plan.name}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {cycleLabel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Paid until: {nextBillingLabel}</p>
                      <p>
                        Last payment:{" "}
                        {hasPaymentHistory
                          ? `${lastPaymentLabel} - ${lastPaymentDate}`
                          : "—"}
                      </p>
                      {user.lastPaymentOrderId && (
                        <p>Order: {user.lastPaymentOrderId}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
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
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
