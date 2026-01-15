"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaidDownloadSettingsProps {
  fileId: string;
  currentPrice?: number;
  currentPreviewEnabled?: boolean;
  isSetupMode?: boolean;
  onSettingsUpdated: () => void;
}

export default function PaidDownloadSettings({
  fileId,
  currentPrice = 0,
  currentPreviewEnabled = true,
  isSetupMode = false,
  onSettingsUpdated,
}: PaidDownloadSettingsProps) {
  const { toast } = useToast();
  const [price, setPrice] = useState(currentPrice);
  const [previewEnabled, setPreviewEnabled] = useState(currentPreviewEnabled);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/v2/paid-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          price,
          previewEnabled,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update settings");
      }

      toast({
        title: isSetupMode ? "Success" : "Success",
        description: isSetupMode
          ? "Paid download setup successfully"
          : "Paid download settings updated successfully",
      });

      onSettingsUpdated(); // Refresh the page or update the UI
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Manage Paid Download</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (IDR)</Label>
          <Input 
            type="number" 
            id="price" 
            value={price} 
            onChange={(e) => setPrice(Number(e.target.value))}
            min="1000" 
            placeholder="Enter price"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="previewEnabled">Enable Preview</Label>
          <Switch 
            id="previewEnabled" 
            checked={previewEnabled} 
            onCheckedChange={setPreviewEnabled}
          />
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Settings"}
        </Button>
      </div>
    </div>
  );
}