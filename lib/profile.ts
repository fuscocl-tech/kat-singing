// The student profile page: the teacher's own singing profile fields, plus which intake
// answers are summarised alongside it.

import type { Field } from "./student-form";

/** Filled in by the teacher; stored on the student record as `profile`. */
export const PROFILE_FIELDS: Field[] = [
  { name: "voice_type", label: "Voice type", type: "text", hint: "e.g. Soprano, Alto, Tenor, Baritone, or still finding out", half: true },
  { name: "vocal_range", label: "Comfortable range", type: "text", hint: "e.g. A3 – E5", half: true },
  { name: "lesson_schedule", label: "Lesson day, time & length", type: "text", hint: "e.g. Tuesdays 4:30pm, 45 min", half: true },
  { name: "level", label: "Level", type: "text", hint: "e.g. Beginner, AMEB Grade 3", half: true },
  { name: "strengths", label: "Strengths", type: "textarea" },
  { name: "working_on", label: "Currently working on", type: "textarea", hint: "Technique, habits, focus areas" },
  { name: "exercises", label: "Go-to warm-ups & exercises", type: "textarea" },
  { name: "agreed_goals", label: "Goals we've agreed on", type: "textarea" },
  { name: "other", label: "Anything else", type: "textarea" },
];

export type Profile = Record<string, string>;

/** Intake answers shown under "General details" on the profile tab. */
export const GENERAL_FIELDS = [
  "full_name",
  "preferred_name",
  "date_of_birth",
  "phone",
  "email",
  "suburb_postcode",
  "school_year",
  "preferred_lesson_time",
] as const;

/** Intake answers shown under "From their intake form" in the singing profile. */
export const INTAKE_SINGING_FIELDS = [
  "had_lessons",
  "lessons_duration",
  "reads_music",
  "practice_frequency",
  "practice_time",
  "learning_style",
  "genres",
  "favourite_artists",
  "songs_to_avoid",
  "goal_areas",
  "goal_other",
  "upcoming_event",
  "voice_flags",
  "access_needs",
] as const;

export function parseProfile(formData: FormData): Profile {
  return Object.fromEntries(
    PROFILE_FIELDS.map((f) => [f.name, String(formData.get(f.name) ?? "").trim().slice(0, 4000)]),
  );
}
