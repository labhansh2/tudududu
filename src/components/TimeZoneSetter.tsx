"use client";

import { useEffect } from "react";

export default function TimezoneSetter() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("timezone="));

    if (!existing || !existing.includes(timezone)) {
      document.cookie = `timezone=${timezone}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  }, []);

  return null;
}
