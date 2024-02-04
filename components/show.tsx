import { ReactNode, useMemo } from "react";

interface ShowProps {
  when: boolean;
  children: ReactNode;
}

const Show: React.FC<ShowProps> = ({ when, children }) => {
  const renderedChildren = useMemo(() => {
    return when ? children : null;
  }, [when, children]);

  return renderedChildren;
};

export default Show;
