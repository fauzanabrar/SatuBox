"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

type Props = {
  fileId: string;
  price: number;
  currency: string;
  sizeLabel: string;
  isOwner?: boolean;
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

export default function PaidDownloadActions(props: Props) {
  const { fileId, price, currency, sizeLabel } = props;
  const { toast } = useToast();
  const { data: session } = useSession();
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localIsOwner, setLocalIsOwner] = useState<boolean | null>(null); // null = not checked yet, boolean = result

  // Determine the final owner status - use prop if provided, otherwise check via API
  const finalIsOwner = props.isOwner !== undefined ? props.isOwner : localIsOwner;

  // Check if user is the owner of the file (only if isOwner prop is not provided)
  useEffect(() => {
    if (props.isOwner !== undefined) {
      // If isOwner prop is provided, use it directly
      setLocalIsOwner(props.isOwner);
      return;
    }

    const checkOwnership = async () => {
      if (!session?.user?.email) {
        setLocalIsOwner(false);
        return;
      }

      try {
        // Make an API call to check if the user is the owner of the file
        const response = await fetch(`/api/v2/share/check-owner/${fileId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setLocalIsOwner(result.isOwner);
        } else {
          setLocalIsOwner(false);
        }
      } catch (error) {
        console.error("Error checking file ownership:", error);
        setLocalIsOwner(false);
      }
    };

    if (session) {
      checkOwnership();
    } else {
      setLocalIsOwner(false);
    }
  }, [session, fileId, props.isOwner]);

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
    // If user is owner, download without token
    if (finalIsOwner) {
      const link = document.createElement("a");
      link.href = `/api/v2/share/download/${fileId}`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  // If user is the owner, show download button without payment
  if (finalIsOwner) {
    return (
      <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
        <Button onClick={handleDownload} className="w-full sm:w-auto">
          Unduh ({sizeLabel}) - Owner
        </Button>
        <p className="max-w-[260px] text-xs text-muted-foreground sm:text-right">
          You are the owner of this file. You can download it without paying.
        </p>
      </div>
    );
  }

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
