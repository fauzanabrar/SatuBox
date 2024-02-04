import { ReactNode } from "react";

export interface MatchProps {
  children: ReactNode;
  when: boolean;
}

export default function Match({ children, when }: MatchProps) {
  return <div>{children}</div>;
}
