import { ReactNode } from "react";

export default function Show({
  when,
  children,
}: {
  when: boolean;
  children: ReactNode;
}) {
  return <div>{when && children}</div>;
}
