import { ReactNode, isValidElement, Children, useMemo } from "react";
import { MatchProps } from "./match";

export default function Switch({ children }: { children: ReactNode }) {
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  for (const child of childrenArray) {
    if (isValidElement<MatchProps>(child) && child.props.when) {
      return child;
    }
  }
}
