import React from 'react';
import Loading from "@/components/loading";

function LoadingPage(props: any) {
  return (
    <div><Loading loading={true} size={200}/></div>
  );
}

export default Loading;