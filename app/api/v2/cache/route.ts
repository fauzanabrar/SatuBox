import { clearCache } from "@/lib/node-cache";

export async function DELETE() {
  clearCache();

  return {
    status: 200,
    message: "Cache cleared",
  };
}
