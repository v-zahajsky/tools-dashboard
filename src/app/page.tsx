import { Suspense } from "react";
import { HomeContent } from "@/components/tools/home-content";

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
