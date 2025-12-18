import { useCallback, useEffect, useMemo, useState } from "react";

import { buildActivityHeatmap, getHeatmapRangeUtc } from "../lib/activity-heatmap.js";
import { fetchJson } from "../lib/http.js";

export function useActivityHeatmap({ baseUrl, accessToken, weeks = 52 }) {
  const range = useMemo(() => getHeatmapRangeUtc({ weeks }), [weeks]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const dailyUrl = new URL("/functions/vibescore-usage-daily", baseUrl);
      dailyUrl.searchParams.set("from", range.from);
      dailyUrl.searchParams.set("to", range.to);
      const res = await fetchJson(dailyUrl.toString(), { headers });
      setDaily(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setError(e?.message || String(e));
      setDaily([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, baseUrl, range.from, range.to]);

  useEffect(() => {
    if (!accessToken) {
      setDaily([]);
      setLoading(false);
      setError(null);
      return;
    }
    refresh();
  }, [accessToken, refresh]);

  const heatmap = useMemo(() => {
    return buildActivityHeatmap({ dailyRows: daily, weeks, to: range.to });
  }, [daily, weeks, range.to]);

  return { range, daily, loading, error, refresh, heatmap };
}

