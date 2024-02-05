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
    <div className="md:w-1/3 border rounded-2xl p-4 mt-4">
      <h3 className="text-md font-semibold tracking-tight mb-4">
        Clear all cache
      </h3>
      <Button variant={"destructive"} onClick={handleClick}>
        Clear
      </Button>
    </div>
  );
}
