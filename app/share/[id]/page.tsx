import { getRestrictByFileId } from "@/lib/supabase/db/restrict";
import { getPaidDownload } from "@/lib/supabase/db/paid-download";
import { getDriveClient } from "@/lib/gdrive";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import type { Metadata } from "next";
import PaidDownloadActionsWrapper from "@/components/share/paid-download-actions-wrapper";
import PaidDownloadSettings from "@/components/share/paid-download-settings";
import ShareLinkCard from "@/components/share/share-link-card";
import FilePreview from "@/components/share/file-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";
import { siteConfig } from "@/lib/config/site";
import { DRIVE_FOLDER_MIME_TYPE } from "@/lib/constants/drive";

export const metadata: Metadata = {
  title: "Shared file",
  description: `Download a shared file from ${siteConfig.productName}.`,
  robots: {
    index: false,
    follow: false,
  },
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
    owners?: Array<{ displayName?: string | null; emailAddress?: string | null; permissionId?: string | null }> | null;
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

  if (!file || file.mimeType === DRIVE_FOLDER_MIME_TYPE) {
    notFound();
  }

  const mimeType = file.mimeType || "application/octet-stream";
  const fileName = file.name || "Untitled file";
  const size = file.size ? Number(file.size) : null;
  const sizeLabel = formatBytes(size);

  // Check if user is the owner of the file using the email approach
  let isOwner = false;
  if (userSession) {
    const user = await userServices.getByUsername(userSession.username);
    isOwner = Boolean(
      user?.email &&
        file.owners?.some(
          (owner) =>
            owner.emailAddress?.toLowerCase() === user.email?.toLowerCase(),
        ),
    );
  }

  const paidDownload = await getPaidDownload(id);
  const paidPrice = paidDownload?.enabled ? paidDownload.price ?? 0 : 0;
  const isPaidDownload = paidPrice > 0;
  const paidCurrency = paidDownload?.currency ?? siteConfig.currency;
  const paidBadgeLabel = isPaidDownload ? "Paid" : "Free";
  const paidBadgeVariant = isPaidDownload ? "default" : "outline";
  const previewEnabled = paidDownload?.previewEnabled ?? true;

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
              {siteConfig.brandMark}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {siteConfig.productName}
              </p>
              <p className="text-lg font-semibold text-foreground">
                Download page
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {userSession ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Welcome, {userSession.name || userSession.username}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/list">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Create account</Link>
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
                  Shared file
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
              {isOwner ? (
                <div className="text-center py-8">
                  <p className="mb-4 text-lg">You are the owner of this file</p>
                  <Button asChild>
                    <Link
                      href={`/api/v2/share/download/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download File
                    </Link>
                  </Button>
                </div>
              ) : isPaidDownload ? (
                <div>
                  {previewEnabled ? (
                    <>
                      <FilePreview
                        fileId={id}
                        mimeType={mimeType}
                        fileName={fileName}
                      />
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                          This file requires payment to download. Sign in to
                          link your purchase to your account.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="mb-4 text-lg">
                        This file has preview disabled
                      </p>
                      <p className="mb-6 text-sm text-muted-foreground">
                        The owner has disabled previews for this file. Pay to
                        access it.
                      </p>
                      <div className="mx-auto max-w-md">
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
                <div>
                  <FilePreview
                    fileId={id}
                    mimeType={mimeType}
                    fileName={fileName}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                File details
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">File name</span>
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">File type</span>
                  <span className="text-sm font-medium text-foreground">{mimeType}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Size</span>
                  <span className="text-sm font-medium text-foreground">{sizeLabel}</span>
                </div>
                {file?.createdTime && (
                  <div className="flex justify-between pb-3">
                    <span className="text-sm text-muted-foreground">Upload date</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDateTime(file.createdTime)}
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
                Download access
              </p>
              {isPaidDownload && !isOwner && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Pay once to unlock unlimited downloads on this device.
                </p>
              )}
              {isPaidDownload && isOwner && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You are the owner of this file. You can download it without paying.
                </p>
              )}
              <div className="mt-5">
                {isPaidDownload ? (
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
                  Sign in to save access
                </p>
                <p className="mt-2">
                  Sign in to sync purchases across devices and avoid losing
                  access when browser data is cleared.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
