import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return <>{children}</>;
}
