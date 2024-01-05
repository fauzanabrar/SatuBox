import React from 'react';
import Loading from "@/components/loading";

function LoadingPage(props: any) {
  return (
    <div className={"h-screen flex items-center justify-center"}>
      <Loading loading={true} size={200}/>
    </div>
  );
}

export default LoadingPage;