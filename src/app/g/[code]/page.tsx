import { Suspense } from "react";
import GroupApp from "./GroupApp";

export default function GroupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <span className="animate-bounce text-5xl">🎁</span>
        </div>
      }
    >
      <GroupApp />
    </Suspense>
  );
}
