"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  fileId: string;
};

export default function ShareLinkCard({ fileId }: Props) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/share/${fileId}`);
  }, [fileId]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        variant: "success",
        title: "Tautan tersalin",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error: any) {
      window.prompt("Salin tautan ini", shareUrl);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Tautan bagikan
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={shareUrl}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!shareUrl}
          className="sm:min-w-[110px]"
        >
          {copied ? "Tersalin" : "Salin tautan"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Bagikan halaman ini kepada siapa pun yang perlu mengunduh file.
      </p>
    </div>
  );
}
