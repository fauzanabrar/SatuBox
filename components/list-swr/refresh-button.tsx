import React from "react";
import { Button } from "../ui/button";
import { LucideRefreshCw } from "lucide-react";

type RefreshButtonSWR = {
  handleClick: () => void;
};

export default function RefreshButtonSWR({
  handleClick,
}: RefreshButtonSWR) {
  return (
    <Button variant={"outline"} className="w-fit px-2" onClick={handleClick}>
      <LucideRefreshCw className="mr-1 h-4 w-4" />
      Refresh
    </Button>
  );
}
