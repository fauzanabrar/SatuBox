import { getRestrictByFileId } from "@/lib/firebase/db/restrict";
import { getPaidDownload } from "@/lib/firebase/db/paid-download";
import { getDriveClient } from "@/lib/gdrive";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import PaidDownloadActions from "@/components/share/paid-download-actions";
import ShareLinkCard from "@/components/share/share-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shared file",
  description: "Download a shared file from Satubox.",
  robots: {
    index: false,
    follow: false,
  },
};

const folderMimeType = "application/vnd.google-apps.folder";

const formatBytes = (size?: number | null) => {
  if (size === null || size === undefined || Number.isNaN(size)) {
    return "Size unavailable";
  }
  if (size === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / Math.pow(1024, power);
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
};

const buildPreview = (id: string, mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return (
      <Image
        src={`/api/v2/share/media/${id}`}
        alt="Shared file preview"
        width={1200}
        height={1200}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="h-auto w-full rounded-xl border border-border object-contain"
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-xl border border-border"
        src={`/api/v2/share/media/${id}`}
      />
    );
  }

  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
      Preview is not available for this file type.
    </div>
  );
};

export default async function ShareFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const restrict = await getRestrictByFileId(id);
  if (restrict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6 py-12">
        <div className="max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Access Restricted
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">
            This file is private
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The owner restricted access to this file.
          </p>
        </div>
      </div>
    );
  }

  let file: {
    name?: string | null;
    mimeType?: string | null;
    size?: string | null;
  } | null = null;
  try {
    const driveClient = await getDriveClient();
    const response = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType, size",
    });
    file = response.data;
  } catch (error: any) {
    notFound();
  }

  if (!file || file.mimeType === folderMimeType) {
    notFound();
  }

  const mimeType = file.mimeType || "application/octet-stream";
  const fileName = file.name || "Untitled file";
  const size = file.size ? Number(file.size) : null;
  const sizeLabel = formatBytes(size);
  const paidDownload = await getPaidDownload(id);
  const paidPrice =
    paidDownload && paidDownload.enabled ? paidDownload.price : 0;
  const paidCurrency = paidDownload?.currency ?? "IDR";
  const paidBadgeLabel = paidPrice > 0 ? "Paid" : "Free";
  const paidBadgeVariant = paidPrice > 0 ? "default" : "outline";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50 text-foreground">
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),transparent_60%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.2),transparent_65%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.35em] text-white">
              S
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Satubox
              </p>
              <p className="text-lg font-semibold text-foreground">
                Halaman unduhan
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Buat akun</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-border/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  File dibagikan
                </p>
                <h1 className="break-all text-2xl font-semibold text-foreground sm:text-3xl">
                  {fileName}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{sizeLabel}</Badge>
                <Badge variant={paidBadgeVariant}>{paidBadgeLabel}</Badge>
              </div>
            </div>
            <div className="mt-5">{buildPreview(id, mimeType)}</div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Akses unduhan
              </p>
              {paidPrice > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Bayar sekali untuk membuka unduhan tanpa batas di perangkat
                  ini.
                </p>
              )}
              <div className="mt-5">
                <PaidDownloadActions
                  fileId={id}
                  price={paidPrice}
                  currency={paidCurrency}
                  sizeLabel={sizeLabel}
                />
              </div>
            </div>

            <ShareLinkCard fileId={id} />

            <div className="rounded-3xl border border-dashed border-border/70 bg-white/70 p-5 text-xs text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">
                Masuk agar akses tersimpan
              </p>
              <p className="mt-2">
                Masuk untuk menyinkronkan pembelian antar perangkat dan
                menghindari hilangnya akses saat data browser dibersihkan.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Dibagikan lewat tautan publik.
        </div>
      </div>
    </div>
  );
}
