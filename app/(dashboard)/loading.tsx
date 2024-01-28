import Loading from "@/components/loading";

export default async function LoadingDashboard() {
  return (
    <div className="w-full flex justify-center h-full items-center">
      <Loading loading={true} size={100} />
    </div>
  );
}
