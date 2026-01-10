"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  fileId: string;
  price: number;
  currency: string;
  sizeLabel: string;
};

const STORAGE_KEY = "satubox_download_tokens";

const readTokens = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, string>;
    }
  } catch {
    return {};
  }
  return {};
};

const writeTokens = (tokens: Record<string, string>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

export default function PaidDownloadActions({
  fileId,
  price,
  currency,
  sizeLabel,
}: Props) {
  const { toast } = useToast();
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokens = readTokens();
    if (tokens[fileId]) {
      setDownloadToken(tokens[fileId]);
    }
  }, [fileId]);

  const downloadUrl = useMemo(() => {
    const tokenParam = downloadToken
      ? `?token=${encodeURIComponent(downloadToken)}`
      : "";
    return `/api/v2/share/download/${fileId}${tokenParam}`;
  }, [downloadToken, fileId]);

  const priceLabel = useMemo(() => {
    if (!price || price <= 0) return "Free";
    if (currency.toUpperCase() === "IDR") {
      return `Rp ${price.toLocaleString("id-ID")}`;
    }
    return `${currency} ${price.toLocaleString("id-ID")}`;
  }, [price, currency]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const storeToken = (token: string) => {
    const tokens = readTokens();
    tokens[fileId] = token;
    writeTokens(tokens);
    setDownloadToken(token);
  };

  const handleVerify = async (orderId: string) => {
    try {
      const response = await fetch("/api/payments/download/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });
      const result = await response.json();
      if (response.status === 202) {
        toast({
          title: "Pembayaran tertunda",
          description: "Selesaikan pembayaran untuk membuka unduhan.",
          duration: 4000,
        });
        return;
      }
      if (!response.ok) {
        throw new Error(result?.message || "Verifikasi gagal");
      }

      const token = result?.data?.token as string;
      if (token) {
        storeToken(token);
      }
      toast({
        variant: "success",
        title: "Pembayaran terverifikasi",
        description:
          "Anda bisa mengunduh file ini kapan saja di perangkat ini.",
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verifikasi gagal",
        description: error?.message || "Terjadi kesalahan.",
        duration: 4000,
      });
    }
  };

  const handleCheckout = async () => {
    if (!window.snap) {
      toast({
        variant: "destructive",
        title: "Pembayaran belum siap",
        description: "Silakan coba lagi sebentar.",
        duration: 4000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/payments/download/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Gagal memulai pembayaran");
      }

      const snapToken = result?.data?.snapToken as string;
      const orderId = result?.data?.orderId as string;
      if (!snapToken || !orderId) {
        throw new Error("Detail pembayaran tidak lengkap");
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          toast({
            variant: "success",
            title: "Pembayaran berhasil",
            description: "Memverifikasi pembelian...",
            duration: 3000,
          });
          await handleVerify(orderId);
        },
        onPending: () => {
          toast({
            title: "Pembayaran tertunda",
            description: "Selesaikan pembayaran untuk membuka unduhan.",
            duration: 4000,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Pembayaran gagal",
            description: "Silakan coba lagi.",
            duration: 4000,
          });
        },
        onClose: () => {
          toast({
            title: "Pembayaran ditutup",
            description: "Anda bisa mencoba lagi kapan saja.",
            duration: 3000,
          });
        },
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Pembayaran gagal",
        description: error?.message || "Terjadi kesalahan.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!price || price <= 0) {
    return (
      <Button onClick={handleDownload} className="w-full sm:w-auto">
        Unduh ({sizeLabel})
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
      {downloadToken ? (
        <Button onClick={handleDownload} className="w-full sm:w-auto">
          Unduh ({sizeLabel})
        </Button>
      ) : (
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Memproses..." : `Bayar ${priceLabel}`}
        </Button>
      )}
      <p className="max-w-[260px] text-xs text-muted-foreground sm:text-right">
        {downloadToken
          ? "Pembayaran tersimpan di perangkat ini. Menghapus data browser dapat menghilangkan akses."
          : "Bayar sekali untuk membuka unduhan tanpa batas di perangkat ini. Tanpa akun, akses disimpan di cache browser."}
      </p>
    </div>
  );
}
