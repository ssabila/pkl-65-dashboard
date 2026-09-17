"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

export function useCsv(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        if (!cancelled) {
          setData(parsed.data);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading };
}

export function useCsvMultiple(urls) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((res) => res.text())
          .then(
            (text) =>
              Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
              }).data
          )
      )
    ).then((results) => {
      if (!cancelled) {
        setData(results);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(urls)]);

  return { data, loading };
}