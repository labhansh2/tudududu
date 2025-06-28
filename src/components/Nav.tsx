"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {

    const pathname = usePathname(); 
    const isActivity = pathname.startsWith("/activity");
    const text = isActivity ? "Task List" : "Activity"  
  return (
    <Link
              href={isActivity ? "/" : "/activity"}
              className="px-3 py-1.5 text-sm font-medium text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {text}
            </Link>
  );
}   