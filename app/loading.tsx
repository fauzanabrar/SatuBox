import Loading from "@/components/loading";

function LoadingPage() {
  return (
    <div className={"h-screen flex items-center justify-center"}>
      <Loading loading={true} size={200}/>
    </div>
  );
}

export default LoadingPage;