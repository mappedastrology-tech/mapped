"use client";

/**
 * The almanac categories a person tracks, shared by the mobile almanac and the
 * desktop WebAlmanac.
 *
 * Stored the way the app stores preferences (lib/syncedSettings): localStorage
 * `mapped:almanac-categories` / `mapped:almanac-custom-names` is the synchronous
 * cache and the signed-out fallback (scoped per account by lib/scopedStorage);
 * the account setting `almanac-categories` / `almanac-custom-names` is the
 * cross-device source of truth, read once signed in and written on every
 * change.
 *
 * Anything the almanac no longer scores is dropped on load: the removed
 * Recovery categories and the medical, money and legal ones, saved or typed in
 * as custom.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { getCategoryDefinitions, isUnscoredTopic } from "@/lib/almanacCategories";

export const CATEGORIES_KEY = "mapped:almanac-categories";
export const CUSTOM_NAMES_KEY = "mapped:almanac-custom-names";
const SETTING = "almanac-categories";
const NAMES_SETTING = "almanac-custom-names";
// "money" was a default; day scores for money decisions were removed.
export const DEFAULT_CATEGORIES = ["communication", "love", "body", "rest", "creativity"];

/** Keep only categories that are still scored; `null` when the input isn't a list. */
export function keepScored(list: unknown): string[] | null {
  if (!Array.isArray(list)) return null;
  const builtIn = new Set(getCategoryDefinitions().map((d) => d.id));
  return list.filter((c): c is string => typeof c === "string" && c.length > 0 && (builtIn.has(c) || !isUnscoredTopic(c)));
}

function parse(raw: string | null): unknown {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

/** Turn a typed name into a category id: "Filming TikToks" → "filming-tiktoks". */
export function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function useAlmanacCategories() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // localStorage first (instant), then the account.
  useEffect(() => {
    const rawLocal = parse(readLocal(CATEGORIES_KEY));
    const local = keepScored(rawLocal);
    if (local) {
      // An empty saved list is a choice; a list emptied by the filter is not.
      const next = local.length > 0 || (Array.isArray(rawLocal) && rawLocal.length === 0) ? local : DEFAULT_CATEGORIES;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories(next);
      if (Array.isArray(rawLocal) && next.length !== rawLocal.length) writeLocal(CATEGORIES_KEY, next);
    }
    const names = parse(readLocal(CUSTOM_NAMES_KEY));
    if (names && typeof names === "object" && !Array.isArray(names)) setCustomNames(names as Record<string, string>);

    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id ?? null;
        if (!uid || cancelled) return;
        setUserId(uid);
        const [remote, remoteNames] = await Promise.all([fetchSetting(uid, SETTING), fetchSetting(uid, NAMES_SETTING)]);
        if (cancelled) return;
        const raw = parse(remote);
        const kept = keepScored(raw);
        if (kept) {
          const next = kept.length > 0 || (Array.isArray(raw) && raw.length === 0) ? kept : DEFAULT_CATEGORIES;
          setCategories(next);
          writeLocal(CATEGORIES_KEY, next);
        }
        const n = parse(remoteNames);
        if (n && typeof n === "object" && !Array.isArray(n)) {
          setCustomNames(n as Record<string, string>);
          writeLocal(CUSTOM_NAMES_KEY, n);
        }
      } catch {
        // signed out / offline — localStorage stands
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = useCallback((next: string[], names?: Record<string, string>) => {
    setCategories(next);
    writeLocal(CATEGORIES_KEY, next);
    if (userId) void saveSetting(userId, SETTING, JSON.stringify(next));
    if (names) {
      setCustomNames(names);
      writeLocal(CUSTOM_NAMES_KEY, names);
      if (userId) void saveSetting(userId, NAMES_SETTING, JSON.stringify(names));
    }
  }, [userId]);

  const add = useCallback((id: string) => {
    if (!categories.includes(id)) save([...categories, id]);
  }, [categories, save]);

  const remove = useCallback((id: string) => {
    save(categories.filter((c) => c !== id));
  }, [categories, save]);

  /**
   * Add a typed-in category. Returns a note to show when it can't be scored
   * (health, money, legal, recovery), else null.
   */
  const addCustom = useCallback((name: string): string | null => {
    const id = slugify(name);
    if (!id) return null;
    if (isUnscoredTopic(id) && !getCategoryDefinitions().some((d) => d.id === id)) {
      return "The almanac doesn't score health, money, legal or recovery decisions — those deserve better than a moon sign.";
    }
    if (!categories.includes(id)) save([...categories, id], { ...customNames, [id]: name.trim() });
    return null;
  }, [categories, customNames, save]);

  return { categories, customNames, add, remove, addCustom };
}
