import Loading from "@/components/loading";

function LoadingPage() {
  return (
    <div className={"flex h-screen w-full items-center justify-center"}>
      <Loading loading={true} size={150} />
    </div>
  );
}

export default LoadingPage;
