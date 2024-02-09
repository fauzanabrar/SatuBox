"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { mutate } from "swr";

export default function ClearCache() {
  const { toast } = useToast();

  const handleClick = async () => {
    await fetch("/api/v2/cache-drive", {
      method: "DELETE",
    });

    mutate(undefined);

    toast({
      title: "Cache cleared",
      description: "Your all cache has been cleared!",
      variant: "success",
      duration: 3000,
    });
  };

  return (
    <div className="mt-4 rounded-2xl border p-4 md:w-1/3">
      <h3 className="text-md mb-4 font-semibold tracking-tight">
        Clear all cache
      </h3>
      <Button variant={"destructive"} onClick={handleClick}>
        Clear
      </Button>
    </div>
  );
}
