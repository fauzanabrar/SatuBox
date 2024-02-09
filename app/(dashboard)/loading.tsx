import Loading from "@/components/loading";

export default async function LoadingDashboard() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loading loading={true} size={100} />
    </div>
  );
}
