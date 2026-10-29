export const STATUSES = [
  { value: "enquiry", label: "New enquiry" },
  { value: "trial", label: "Trial booked" },
  { value: "active", label: "Active" },
  { value: "waitlist", label: "Waitlist" },
  { value: "paused", label: "Paused" },
  { value: "former", label: "Former" },
] as const;

export type Status = (typeof STATUSES)[number]["value"];

export function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const NOTE_KINDS = [
  { value: "note", label: "Note" },
  { value: "lesson", label: "Lesson" },
  { value: "call", label: "Call / message" },
  { value: "payment", label: "Payment" },
] as const;
