import { statusLabel } from "@/lib/options";

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{statusLabel(status)}</span>;
}
