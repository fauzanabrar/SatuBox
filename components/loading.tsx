import { LucideLoader2 } from "lucide-react";

type ParamsType = {
  loading: boolean;
  size: number;
  className?: string;
};

export default function Loading({ loading, size, className }: ParamsType) {
  return (
    <div>
      {loading && (
        <LucideLoader2
          width={size}
          height={size}
          className={className + " animate-spin"}
        />
      )}
    </div>
  );
}
