"use client";

import { useEffect, useState } from "react";
import { DialogClose, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DialogItem } from "./dialog-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Loading from "../../loading";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  fileId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
};

const DialogItemPaidDownload = ({
  fileId,
  isOpen,
  setIsOpen,
  handleDialogItemSelect,
  handleDialogItemOpenChange,
}: Props) => {
  const { toast } = useToast();
  const [price, setPrice] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/v2/paid-download?fileId=${encodeURIComponent(fileId)}`,
        );
        const result = await response.json();
        if (response.ok) {
          const nextPrice = Number(result?.data?.price ?? 0);
          setEnabled(Boolean(result?.data?.enabled));
          setPrice(nextPrice > 0 ? String(nextPrice) : "");
          setPreviewEnabled(Boolean(result?.data?.previewEnabled ?? true));
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load price",
          description: error?.message || "Something went wrong.",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fileId, isOpen, toast]);

  const handleSave = async () => {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Price must be greater than zero.",
        duration: 4000,
      });
      return;
    }
    if (!Number.isInteger(numericPrice)) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Price must be a whole number (IDR).",
        duration: 4000,
      });
      return;
    }
    if (numericPrice < 1000) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Minimum price is Rp 1.000.",
        duration: 4000,
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/v2/paid-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, price: numericPrice, previewEnabled }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to save price");
      }
      setEnabled(true);
      toast({
        variant: "success",
        title: "Paid download enabled",
        duration: 3000,
      });
      setIsOpen(false);
      handleDialogItemOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error?.message || "Something went wrong.",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/v2/paid-download", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to disable");
      }
      setEnabled(false);
      setPrice("");
      setPreviewEnabled(true);
      toast({
        variant: "success",
        title: "Paid download disabled",
        duration: 3000,
      });
      setIsOpen(false);
      handleDialogItemOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to disable",
        description: error?.message || "Something went wrong.",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogItem
      isOpen={isOpen}
      triggerChildren={<span>Paid download</span>}
      onSelect={() => {
        setIsOpen(true);
        handleDialogItemSelect();
      }}
      onOpenChange={handleDialogItemOpenChange}
      className={"w-96"}
    >
      <DialogTitle>Paid Download</DialogTitle>
      <div className="grid gap-4 py-2 text-sm text-muted-foreground">
        <p>
          Require payment before anyone can download this file from the share
          page.
        </p>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Price (IDR)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="1000"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={loading || saving}
          />
          <p className="text-xs text-muted-foreground">Minimum Rp 1.000.</p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="previewEnabled" className="text-sm font-medium text-foreground">
            Enable Preview
          </Label>
          <Switch
            id="previewEnabled"
            checked={previewEnabled}
            onCheckedChange={setPreviewEnabled}
            disabled={loading || saving}
          />
        </div>
        {enabled && (
          <p className="text-xs text-muted-foreground">
            Paid download is active for this file.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          className="flex gap-2"
          variant="default"
          onClick={handleSave}
          disabled={loading || saving}
        >
          <Loading loading={saving} size={18} />
          Save
        </Button>
        {enabled && (
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={loading || saving}
          >
            Disable
          </Button>
        )}
        <DialogClose asChild>
          <Button variant="outline" disabled={saving}>
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogItem>
  );
};

export default DialogItemPaidDownload;
