"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Mirrors display preferences onto <html> data attributes, where the CSS picks them up. */
export function DisplayPrefsApplier() {
  const prefs = useStore((s) => s.prefs);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.text = prefs.text;
    el.dataset.motion = prefs.reduceMotion ? "reduce" : "";
    el.dataset.links = prefs.underlineLinks ? "underline" : "";
    el.dataset.contrast = prefs.highContrast ? "high" : "";
  }, [prefs]);
  return null;
}

/**
 * Runs before first paint so large text or high contrast never flashes in late.
 * Reads the same localStorage key the store persists to.
 */
export const PREFS_BOOT_SCRIPT = `try{var p=(JSON.parse(localStorage.getItem("landed")||"{}").state||{}).prefs;if(p){var d=document.documentElement.dataset;d.text=p.text||"default";d.motion=p.reduceMotion?"reduce":"";d.links=p.underlineLinks?"underline":"";d.contrast=p.highContrast?"high":""}}catch(e){}`;
