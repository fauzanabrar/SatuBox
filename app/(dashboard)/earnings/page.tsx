"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/jotai/user-atom";
import type {
  DownloadEarning,
  WithdrawRequest,
} from "@/lib/firebase/db/earnings";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatCurrency = (value?: number | null) => {
  if (!Number.isFinite(value ?? NaN)) return "Rp 0";
  return `Rp ${(value ?? 0).toLocaleString("id-ID")}`;
};

const getDateFromValue = (value?: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object") {
    const asAny = value as { toDate?: () => Date; seconds?: number };
    if (typeof asAny.toDate === "function") {
      return getDateFromValue(asAny.toDate());
    }
    if (typeof asAny.seconds === "number") {
      return new Date(asAny.seconds * 1000);
    }
  }
  return null;
};

const formatDateTime = (value?: unknown) => {
  const parsed = getDateFromValue(value);
  if (!parsed) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

export default function EarningsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR("/api/v2/earnings", fetcher);
  const [userSession] = useAtom(userAtom);
  const isAdmin = userSession?.role === "admin";
  const [mounted, setMounted] = useState(false);
  const { data: adminWithdrawalsData, mutate: mutateAdminWithdrawals } =
    useSWR(isAdmin ? "/api/v2/withdrawals" : null, fetcher);
  const earnings = (data?.data?.earnings ?? []) as DownloadEarning[];
  const withdrawals = (data?.data?.withdrawals ?? []) as WithdrawRequest[];
  const adminWithdrawals = (adminWithdrawalsData?.data ?? []) as WithdrawRequest[];
  const totals = data?.data?.totals ?? {};
  const minWithdrawAmount = data?.data?.minWithdrawAmount ?? 50000;

  const [amount, setAmount] = useState("");
  const [methodType, setMethodType] = useState("bank");
  const [provider, setProvider] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawFilter, setWithdrawFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const bankProviders = [
    "BCA",
    "BNI",
    "BRI",
    "Mandiri",
    "Permata",
    "CIMB Niaga",
    "Danamon",
  ];
  const ewalletProviders = ["GoPay", "OVO", "DANA", "ShopeePay"];
  const providerOptions =
    methodType === "ewallet" ? ewalletProviders : bankProviders;

  const sortedEarnings = useMemo(() => {
    return [...earnings].sort((a, b) => {
      const aTime = getDateFromValue(a.createdAt)?.getTime() ?? 0;
      const bTime = getDateFromValue(b.createdAt)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [earnings]);

  const sortedWithdrawals = useMemo(() => {
    return [...withdrawals].sort((a, b) => {
      const aTime = getDateFromValue(a.createdAt)?.getTime() ?? 0;
      const bTime = getDateFromValue(b.createdAt)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [withdrawals]);

  const filteredWithdrawals = useMemo(() => {
    return sortedWithdrawals.filter((item) => {
      const methodValue = item.method || "bank";
      const methodMatch =
        withdrawFilter === "all" || methodValue === withdrawFilter;
      return methodMatch;
    });
  }, [sortedWithdrawals, withdrawFilter]);

  const filteredAdminWithdrawals = useMemo(() => {
    return adminWithdrawals
      .slice()
      .sort((a: WithdrawRequest, b: WithdrawRequest) => {
        const aTime = getDateFromValue(a.createdAt)?.getTime() ?? 0;
        const bTime = getDateFromValue(b.createdAt)?.getTime() ?? 0;
        return bTime - aTime;
      })
      .filter((item) => {
        const methodValue = item.method || "bank";
        const methodMatch =
          withdrawFilter === "all" || methodValue === withdrawFilter;
        const statusMatch =
          statusFilter === "all" || item.status === statusFilter;
        return methodMatch && statusMatch;
      });
  }, [adminWithdrawals, statusFilter, withdrawFilter]);

  const handleWithdraw = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Nominal tidak valid",
        description: "Masukkan jumlah penarikan yang benar.",
        duration: 4000,
      });
      return;
    }
    if (!provider || !accountName || !accountNumber) {
      toast({
        variant: "destructive",
        title: "Data rekening belum lengkap",
        description:
          "Lengkapi provider, nama pemilik rekening, dan nomor rekening.",
        duration: 4000,
      });
      return;
    }
    if (numericAmount < minWithdrawAmount) {
      toast({
        variant: "destructive",
        title: "Nominal terlalu kecil",
        description: `Minimal penarikan Rp ${minWithdrawAmount.toLocaleString(
          "id-ID",
        )}.`,
        duration: 4000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/v2/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          methodType,
          provider,
          accountName,
          accountNumber,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengajukan penarikan");
      }
      toast({
        variant: "success",
        title: "Penarikan diajukan",
        description: "Permintaan Anda sedang diproses.",
        duration: 3000,
      });
      setAmount("");
      setProvider("");
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Penarikan gagal",
        description: error?.message || "Terjadi kesalahan.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminStatus = async (
    id: string,
    status: "approved" | "paid" | "rejected",
  ) => {
    try {
      const response = await fetch("/api/v2/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Gagal memperbarui status");
      }
      toast({
        variant: "success",
        title: "Status diperbarui",
        duration: 3000,
      });
      await mutateAdminWithdrawals();
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui status",
        description: error?.message || "Terjadi kesalahan.",
        duration: 4000,
      });
    }
  };

  return (
    <div className="col-span-3 lg:col-span-4">
      <div className="px-4 py-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Pendapatan
          </h2>
          <p className="text-sm text-muted-foreground">
            Lacak pemasukan unduhan berbayar dan ajukan penarikan saldo.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Saldo tersedia</CardDescription>
              <CardTitle>{formatCurrency(totals.available)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total bersih</CardDescription>
              <CardTitle>{formatCurrency(totals.net)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total biaya (1%)</CardDescription>
              <CardTitle>{formatCurrency(totals.fee)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Tertahan</CardDescription>
              <CardTitle>{formatCurrency(totals.reserved)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <Card>
            <CardHeader>
              <CardTitle>Ledger unduhan berbayar</CardTitle>
              <CardDescription>
                Riwayat transaksi yang menghasilkan saldo Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Biaya</TableHead>
                    <TableHead>Netto</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && sortedEarnings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        Belum ada transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedEarnings.map((earning) => (
                    <TableRow key={earning.orderId}>
                      <TableCell>
                        {formatDateTime(earning.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {earning.fileId}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(earning.grossAmount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(earning.feeAmount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(earning.netAmount)}
                      </TableCell>
                      <TableCell>{earning.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajukan penarikan</CardTitle>
              <CardDescription>
                Minimum penarikan Rp {minWithdrawAmount.toLocaleString(
                  "id-ID",
                )}
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Nominal penarikan"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={loading}
              />
              <Select
                value={methodType}
                onValueChange={(value) => {
                  setMethodType(value);
                  setProvider("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pencairan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Transfer bank</SelectItem>
                  <SelectItem value="ewallet">E-wallet</SelectItem>
                </SelectContent>
              </Select>
              <Select value={provider} onValueChange={(value) => setProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penyedia" />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Nama pemilik rekening"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                disabled={loading}
              />
              <Input
                placeholder={
                  methodType === "ewallet"
                    ? "Nomor ponsel e-wallet"
                    : "Nomor rekening"
                }
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                disabled={loading}
              />
              <Button onClick={handleWithdraw} disabled={loading}>
                {loading ? "Memproses..." : "Ajukan penarikan"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Pencairan diproses manual via Midtrans sementara ini.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat penarikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-2">
                <Select
                  value={withdrawFilter}
                  onValueChange={(value) => setWithdrawFilter(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua metode</SelectItem>
                    <SelectItem value="bank">Transfer bank</SelectItem>
                    <SelectItem value="ewallet">E-wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading && filteredWithdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        Belum ada penarikan.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredWithdrawals.map((withdraw) => (
                    <TableRow key={withdraw.id}>
                      <TableCell>
                        {formatDateTime(withdraw.createdAt)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {withdraw.method === "ewallet"
                          ? "E-wallet"
                          : "Bank"}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {withdraw.provider || withdraw.bankName} - {withdraw.accountNumber}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(withdraw.amount)}
                      </TableCell>
                      <TableCell>{withdraw.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {mounted && isAdmin && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Persetujuan penarikan (Admin)</CardTitle>
                <CardDescription>
                  Kelola permintaan penarikan pengguna.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={withdrawFilter}
                    onValueChange={(value) => setWithdrawFilter(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Semua metode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua metode</SelectItem>
                      <SelectItem value="bank">Transfer bank</SelectItem>
                      <SelectItem value="ewallet">E-wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdminWithdrawals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          Tidak ada permintaan.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAdminWithdrawals.map((withdraw, index) => {
                      const withdrawKey =
                        withdraw.id ?? `${withdraw.username}-${index}`;
                      return (
                        <TableRow key={withdrawKey}>
                      <TableCell>
                        {formatDateTime(withdraw.createdAt)}
                      </TableCell>
                        <TableCell>{withdraw.username}</TableCell>
                        <TableCell className="capitalize">
                          {withdraw.method === "ewallet"
                            ? "E-wallet"
                            : "Bank"}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">
                          {withdraw.provider || withdraw.bankName} - {withdraw.accountNumber}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(withdraw.amount)}
                        </TableCell>
                        <TableCell>{withdraw.status}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!withdraw.id) return;
                                handleAdminStatus(withdraw.id, "approved");
                              }}
                              disabled={
                                withdraw.status !== "pending" ||
                                !withdraw.id
                              }
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!withdraw.id) return;
                                handleAdminStatus(withdraw.id, "paid");
                              }}
                              disabled={
                                withdraw.status !== "approved" ||
                                !withdraw.id
                              }
                            >
                              Tandai dibayar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (!withdraw.id) return;
                                handleAdminStatus(withdraw.id, "rejected");
                              }}
                              disabled={
                                withdraw.status === "paid" ||
                                withdraw.status === "rejected" ||
                                !withdraw.id
                              }
                            >
                              Tolak
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
