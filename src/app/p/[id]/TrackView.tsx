"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function TrackView({ id }: { id: number }) {
  const viewed = useStore((s) => s.viewed);
  useEffect(() => viewed(id), [id, viewed]);
  return null;
}
