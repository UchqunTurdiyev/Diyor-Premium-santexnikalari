"use client";

import { useEffect } from "react";

export default function AutoDial({ href }: { href: string }) {
  useEffect(() => {
    window.location.href = href;
  }, [href]);
  return null;
}
