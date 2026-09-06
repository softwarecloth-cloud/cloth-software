"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/api/api";

/**
 * Minimal GET-and-cache hook. Refetches automatically whenever `path` changes
 * (build the query string into the path and the list re-loads on filter change).
 */
export function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(path);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

/** Build a `?a=1&b=2` string, dropping empty values. */
export function qs(params) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
}
