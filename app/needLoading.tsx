import Loading from "@/components/loading";

function LoadingPage() {
  return (
    <div className={"h-screen w-full flex items-center justify-center"}>
      <Loading loading={true} size={150} />
    </div>
  );
}

export default LoadingPage;
