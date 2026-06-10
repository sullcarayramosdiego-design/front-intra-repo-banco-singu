 "use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HashScrollContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Find element by hash selector
        const element = document.querySelector(hash);
        if (element) {
          // Scroll with a slight delay to allow rendering/layout to adjust
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      }
    };

    // Listen to hashchange events (for same-tab navigations)
    window.addEventListener("hashchange", handleScroll);

    // Trigger on initial tab load/change
    handleScroll();

    return () => {
      window.removeEventListener("hashchange", handleScroll);
    };
  }, [searchParams]);

  return null;
}

export function HashScrollHandler() {
  return (
    <Suspense fallback={null}>
      <HashScrollContent />
    </Suspense>
  );
}
