import { getRestrictByFileId } from "@/lib/supabase/db/restrict";
import { getPaidDownload } from "@/lib/supabase/db/paid-download";
import { getDriveClient } from "@/lib/gdrive";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import PaidDownloadActionsWrapper from "@/components/share/paid-download-actions-wrapper";
import PaidDownloadSettings from "@/components/share/paid-download-settings";
import ShareLinkCard from "@/components/share/share-link-card";
import TextPreview from "@/components/share/text-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/next-auth/user-session";
import { getDownloadToken } from "@/lib/supabase/db/paid-download";

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

const isTextLike = (mimeType: string) => mimeType.startsWith("text/");

const buildPreview = (id: string, mimeType: string, fileName: string) => {
  const mediaUrl = `/api/v2/share/media/${id}`;

  if (mimeType.startsWith("image/")) {
    return (
      <Image
        src={mediaUrl}
        alt={`Preview of ${fileName}`}
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
        src={mediaUrl}
      />
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <audio
        controls
        preload="metadata"
        className="w-full rounded-xl border border-border"
        src={mediaUrl}
      />
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <iframe
        title={`PDF preview for ${fileName}`}
        src={mediaUrl}
        className="h-[70vh] w-full rounded-xl border border-border"
      />
    );
  }

  if (isTextLike(mimeType)) {
    return <TextPreview fileId={id} mimeType={mimeType} />;
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

  const userSession = await getUserSession();
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
    owners?: Array<{ displayName?: string; emailAddress?: string; permissionId?: string }> | null;
    createdTime?: string | null;
    webViewLink?: string | null;
  } | null = null;
  try {
    const driveClient = await getDriveClient();
    const response = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType, size, owners, createdTime, webViewLink",
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

  // Check if user is the owner of the file using the email approach
  const isOwner = userSession?.email && file.owners?.some(owner =>
    owner.emailAddress?.toLowerCase() === userSession.email.toLowerCase()
  ) || false;

  const paidDownload = await getPaidDownload(id);
  const paidPrice = paidDownload && paidDownload.enabled ? paidDownload.price : 0;
  const paidCurrency = paidDownload?.currency ?? "IDR";
  const paidBadgeLabel = paidPrice > 0 ? "Paid" : "Free";
  const paidBadgeVariant = paidPrice > 0 ? "default" : "outline";
  const previewEnabled = paidDownload?.previewEnabled ?? true; // Default to true if not set

  // Check if user has already purchased this file
  let hasPurchased = false;
  if (userSession && paidDownload && paidDownload.enabled && paidPrice > 0) {
    // Check if there's a download token for this file and user
    // This would require checking if the user has a valid download token
    // For now, we'll check if there's any download order for this file that was paid by this user
    // This would require additional database queries to check user's purchase history
    // For now, we'll skip this check and just show the preview if it's the owner
  }

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
            {userSession ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Welcome, {userSession.name || userSession.username}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Buat akun</Link>
                </Button>
              </>
            )}
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
                {isOwner && (
                  <Badge variant="outline">Owner</Badge>
                )}
              </div>
            </div>
            <div className="mt-5">
              {/* Show preview or download based on conditions */}
              {isOwner ? (
                // Owner can always download without paying
                <div className="text-center py-8">
                  <p className="text-lg mb-4">You are the owner of this file</p>
                  <Button asChild>
                    <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                      Download File
                    </Link>
                  </Button>
                </div>
              ) : paidPrice > 0 ? (
                // For paid files, check preview setting but always allow owner access
                <div>
                  {isOwner ? (
                    // Owner can always see preview/download regardless of preview setting
                    <div className="text-center py-8">
                      <p className="text-lg mb-4">You are the owner of this file</p>
                      <Button asChild>
                        <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                          Download File (Owner)
                        </Link>
                      </Button>
                    </div>
                  ) : previewEnabled ? (
                    // For non-owners, check preview setting
                    <>
                      {buildPreview(id, mimeType, fileName)}
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          This file requires payment to download. Sign in to link your purchase to your account.
                        </p>
                      </div>
                    </>
                  ) : (
                    // For non-owners with preview disabled
                    <div className="text-center py-8">
                      <p className="text-lg mb-4">This file has preview disabled</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        The owner has disabled previews for this file. Pay to access it.
                      </p>
                      <div className="max-w-md mx-auto">
                        <PaidDownloadActionsWrapper
                          fileId={id}
                          price={paidPrice}
                          currency={paidCurrency}
                          sizeLabel={sizeLabel}
                          isOwner={isOwner}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // For free files, show preview
                <div>
                  {buildPreview(id, mimeType, fileName)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Detail File
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Nama File</span>
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Tipe File</span>
                  <span className="text-sm font-medium text-foreground">{mimeType}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Ukuran</span>
                  <span className="text-sm font-medium text-foreground">{sizeLabel}</span>
                </div>
                {file?.createdTime && (
                  <div className="flex justify-between pb-3">
                    <span className="text-sm text-muted-foreground">Tanggal Upload</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(file.createdTime).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
              {isOwner && (
                <Button asChild className="mt-4 w-full">
                  <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                    Download File
                  </Link>
                </Button>
              )}
            </div>

            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Akses unduhan
              </p>
              {paidPrice > 0 && !isOwner && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Bayar sekali untuk membuka unduhan tanpa batas di perangkat
                  ini.
                </p>
              )}
              {paidPrice > 0 && isOwner && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You are the owner of this file. You can download it without paying.
                </p>
              )}
              <div className="mt-5">
                {paidPrice > 0 ? (
                  <>
                    {!isOwner ? (
                      <PaidDownloadActionsWrapper
                        fileId={id}
                        price={paidPrice}
                        currency={paidCurrency}
                        sizeLabel={sizeLabel}
                        isOwner={isOwner}
                      />
                    ) : (
                      <div className="space-y-4">
                        <Button asChild className="w-full">
                          <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                            Download File (Owner)
                          </Link>
                        </Button>
                        <PaidDownloadSettings
                          fileId={id}
                          currentPrice={paidPrice}
                          currentPreviewEnabled={previewEnabled}
                          onSettingsUpdated={() => window.location.reload()}
                        />
                      </div>
                    )}
                  </>
                ) : isOwner ? (
                  <div className="space-y-4">
                    <Button asChild className="w-full">
                      <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                        Download File
                      </Link>
                    </Button>
                    <PaidDownloadSettings
                      fileId={id}
                      currentPrice={0}
                      currentPreviewEnabled={true}
                      isSetupMode={true}
                      onSettingsUpdated={() => window.location.reload()}
                    />
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/api/v2/share/download/${id}`} target="_blank" rel="noopener noreferrer">
                      Download File
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <ShareLinkCard fileId={id} />

            {userSession ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-white/70 p-5 text-xs text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">
                  Signed in as {userSession.name || userSession.username}
                </p>
                <p className="mt-2">
                  Your purchases will be linked to this account.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 bg-white/70 p-5 text-xs text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">
                  Masuk agar akses tersimpan
                </p>
                <p className="mt-2">
                  Masuk untuk menyinkronkan pembelian antar perangkat dan
                  menghindari hilangnya akses saat data browser dibersihkan.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Dibagikan lewat tautan publik.
        </div>
      </div>
    </div>
  );
}
