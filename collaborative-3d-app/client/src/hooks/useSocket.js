import { useMemo } from "react";
import io from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useSocket() {
  // Only create one socket instance per app session!
  const socket = useMemo(() => io(API), []);
  return socket;
}
