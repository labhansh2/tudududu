"use client";

import Link from "next/link";
import { ActivityIcon, ListIcon } from "lucide-react";
import { usePathname } from "next/navigation";

// TODO: low :persist query params from /activity and /activity/timeline
export default function Nav() {
  const pathname = usePathname();
  const isActivity = pathname.startsWith("/activity");
  const text = isActivity ? (
    <ListIcon className="w-4 h-4" />
  ) : (
    <ActivityIcon className="w-4 h-4" />
  );
  return (
    <Link
      href={isActivity ? "/" : "/activity"}
      className="px-3 py-1.5 text-sm font-medium text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
    >
      {text}
    </Link>
  );
}
