import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay = 500): T {
  const [dbValue, setDbValue] = useState<T>(value);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeout.current = setTimeout(() => setDbValue(value), delay);

    return () => {
      clearTimeout(timeout.current);
    };
  }, [value, delay]);

  return dbValue;
}
