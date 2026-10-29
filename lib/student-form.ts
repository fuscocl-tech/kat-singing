// The intake form, defined once. It drives the public form, the teacher's edit form,
// the student record page and the database columns (see lib/db.ts).
// Wording follows the studio's "New Singing Student Intake Form" document.

export type FieldType = "text" | "email" | "tel" | "date" | "textarea" | "radio" | "checks";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  hint?: string;
  /** Required on the public intake form. */
  required?: boolean;
  /** Takes half the row on wide screens. */
  half?: boolean;
  autoComplete?: string;
};

export type FormSection = {
  title: string;
  description?: string;
  /** Sensitive section: highlighted on the student record when filled in. */
  sensitive?: boolean;
  fields: Field[];
};

export const INTAKE_INTRO =
  "Please complete as much as you feel comfortable sharing. Health information is requested only to help plan safe, appropriate vocal tuition. You may discuss sensitive details privately with your teacher.";

export const ACKNOWLEDGEMENT =
  "The information provided will be used to plan vocal tuition and should be handled confidentially. Singing tuition is not a substitute for medical assessment; persistent pain, hoarseness or voice loss should be discussed with a qualified healthcare professional.";

export const VOICE_FLAGS = [
  "My voice is currently comfortable for speaking and singing",
  "I sometimes experience hoarseness, strain, pain or vocal fatigue",
  "I have experienced voice loss or recurring throat / voice difficulties",
  "My voice is currently changing / has changed recently (e.g. puberty)",
  "I have allergies, asthma, reflux or other factors that may affect singing",
  "I have seen an ENT, speech pathologist or other voice professional",
  "I prefer to discuss my voice or health history privately",
] as const;

export const GOAL_AREAS = [
  "Confidence and enjoyment",
  "Healthy vocal technique / reducing strain",
  "Breath coordination and stamina",
  "Pitch accuracy / ear training",
  "Vocal range, tone and flexibility",
  "Expression, interpretation and musicality",
  "Performance skills / stage presence",
  "Auditions, exams or performances",
  "Songwriting, recording or microphone technique",
  "Other",
] as const;

export const FORM_SECTIONS: FormSection[] = [
  {
    title: "Student details",
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true, autoComplete: "name" },
      { name: "preferred_name", label: "Preferred name", type: "text", hint: "Optional", half: true },
      { name: "pronouns", label: "Pronouns", type: "text", hint: "Optional", half: true },
      { name: "date_of_birth", label: "Date of birth", type: "date", required: true, half: true },
      { name: "suburb_postcode", label: "Home suburb / postcode", type: "text", half: true, autoComplete: "address-level2" },
      { name: "phone", label: "Phone (if applicable)", type: "tel", half: true, autoComplete: "tel" },
      { name: "email", label: "Email (if applicable)", type: "email", half: true, autoComplete: "email" },
      { name: "school_year", label: "School / year level (if applicable)", type: "text", hint: "Optional", half: true },
      { name: "preferred_lesson_time", label: "Preferred lesson day / time", type: "text", hint: "Optional", half: true },
    ],
  },
  {
    title: "Parent / caregiver & emergency contacts",
    description: "Complete for students under 18, or where a caregiver is involved.",
    fields: [
      { name: "guardian_name", label: "Parent / caregiver name and relationship", type: "text", hint: "e.g. Jane Smith (mother)" },
      { name: "guardian_phone", label: "Phone number", type: "tel", half: true },
      { name: "guardian_email", label: "Email address", type: "email", half: true },
      { name: "guardian2_name", label: "Second parent / caregiver", type: "text", hint: "Optional", half: true },
      { name: "guardian2_contact", label: "Second contact phone / email", type: "text", half: true },
      { name: "emergency_name", label: "Emergency contact name and relationship", type: "text", half: true },
      { name: "emergency_phone", label: "Emergency contact phone", type: "tel", half: true },
    ],
  },
  {
    title: "Voice history & vocal wellbeing",
    description: "Tick any that apply and add details where helpful. You do not need to provide a diagnosis.",
    sensitive: true,
    fields: [
      { name: "voice_flags", label: "Tick any that apply", type: "checks", options: VOICE_FLAGS },
      {
        name: "voice_details",
        label: "Details, triggers, advice received or accommodations that may help",
        type: "textarea",
        hint: "Optional",
      },
      { name: "voice_demands", label: "Approximate speaking / singing demands each week", type: "text", hint: "Optional" },
    ],
  },
  {
    title: "Singing & music experience",
    fields: [
      { name: "had_lessons", label: "Have you had singing lessons before?", type: "radio", options: ["Yes", "No"], half: true },
      { name: "lessons_duration", label: "If yes, for how long?", type: "text", half: true },
      { name: "ensemble_experience", label: "Choir, ensemble, musical theatre or band experience", type: "textarea" },
      { name: "instruments", label: "Instruments played / other music lessons", type: "text" },
      { name: "performance_experience", label: "Performance, audition or recording experience", type: "textarea" },
      {
        name: "reads_music",
        label: "Music reading ability",
        type: "radio",
        options: ["Beginner", "Some", "Confident", "Unsure"],
        half: true,
      },
      {
        name: "practice_frequency",
        label: "Do you practise singing currently?",
        type: "radio",
        options: ["Rarely", "Sometimes", "Regularly"],
        half: true,
      },
      { name: "learning_history", label: "What has worked well in previous musical learning? Any challenges?", type: "textarea" },
    ],
  },
  {
    title: "Musical tastes & preferences",
    fields: [
      { name: "genres", label: "Favourite genres / styles", type: "text", half: true },
      { name: "favourite_artists", label: "Favourite singers / bands", type: "text", half: true },
      { name: "songs_to_learn", label: "Songs you love to sing or would like to learn", type: "textarea" },
      { name: "songs_to_avoid", label: "Styles or songs you would prefer to avoid", type: "text", half: true },
      { name: "languages", label: "Languages you enjoy singing in", type: "text", hint: "Optional", half: true },
    ],
  },
  {
    title: "Goals for vocal tuition",
    fields: [
      { name: "goal_areas", label: "What would you most like to work on? Tick all that apply.", type: "checks", options: GOAL_AREAS },
      { name: "goal_other", label: "Other", type: "text", hint: "If you ticked Other, tell me more" },
      { name: "top_goals", label: "What are your top 1–3 goals for the next 3–6 months?", type: "textarea" },
      { name: "upcoming_event", label: "Is there an upcoming performance, audition or event you are preparing for?", type: "textarea" },
      { name: "success_factors", label: "What would make singing lessons feel enjoyable, safe and successful for you?", type: "textarea" },
    ],
  },
  {
    title: "Learning preferences & practical notes",
    fields: [
      {
        name: "learning_style",
        label: "How do you learn best?",
        type: "radio",
        options: ["Listening", "Demonstration", "Written notes", "A mix"],
      },
      { name: "access_needs", label: "Access or learning needs / adjustments you would like the teacher to know", type: "textarea", hint: "Optional" },
      { name: "practice_time", label: "Practice time available between lessons (approximate)", type: "text" },
      { name: "anything_else", label: "Anything else you would like your teacher to know?", type: "textarea" },
    ],
  },
  {
    title: "Acknowledgement",
    description: ACKNOWLEDGEMENT,
    fields: [
      {
        name: "signature_name",
        label: "Student / parent or caregiver signature",
        type: "text",
        hint: "Type your full name. A parent or caregiver should sign for students under 18.",
        required: true,
        half: true,
      },
      { name: "signature_date", label: "Date", type: "date", half: true },
    ],
  },
];

export const ALL_FIELDS = FORM_SECTIONS.flatMap((s) => s.fields);
export const LIST_FIELDS = ALL_FIELDS.filter((f) => f.type === "checks").map((f) => f.name);

export type StudentInput = Record<string, string>;
export type FormValues = Record<string, string | string[]>;
export type FormErrors = Record<string, string>;
export type FormState = { errors: FormErrors; values: FormValues; attempt: number } | null;

// Checkbox answers are stored as one text column; options never contain this separator.
export const LIST_SEPARATOR = "; ";

export function ageFrom(dateOfBirth: string, now = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age >= 0 && age < 130 ? age : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseStudentForm(formData: FormData, mode: "intake" | "admin") {
  const values: FormValues = {};
  const input: StudentInput = {};

  for (const field of ALL_FIELDS) {
    if (field.type === "checks") {
      const allowed = new Set(field.options);
      const list = formData.getAll(field.name).map(String).filter((v) => allowed.has(v));
      values[field.name] = list;
      input[field.name] = list.join(LIST_SEPARATOR);
    } else {
      let value = String(formData.get(field.name) ?? "").trim().slice(0, 4000);
      if (field.type === "radio" && !field.options?.includes(value)) value = "";
      values[field.name] = value;
      input[field.name] = value;
    }
  }

  const errors: FormErrors = {};
  if (!input.full_name) errors.full_name = "Please enter the student's full name.";
  for (const name of ["email", "guardian_email"]) {
    if (input[name] && !EMAIL_RE.test(input[name])) errors[name] = "That email address doesn't look right.";
  }
  for (const name of ["date_of_birth", "signature_date"]) {
    if (input[name] && ageFrom(input[name]) === null) errors[name] = "Please enter a valid date.";
  }

  if (mode === "intake") {
    for (const field of ALL_FIELDS) {
      if (field.required && !input[field.name] && !errors[field.name]) errors[field.name] = "This is required.";
    }
    if (!input.email && !input.phone && !input.guardian_email && !input.guardian_phone) {
      errors.email ??= "Please give a phone number or email for the student or a parent / caregiver.";
    }
    const age = ageFrom(input.date_of_birth);
    if (age !== null && age < 18) {
      if (!input.guardian_name) errors.guardian_name = "Please add a parent or caregiver for students under 18.";
      if (!input.guardian_phone && !input.guardian_email)
        errors.guardian_phone = "Please give a parent or caregiver phone number or email.";
    }
  }

  return { input, values, errors };
}

export function toFormValues(row: Record<string, unknown>): FormValues {
  const values: FormValues = {};
  for (const field of ALL_FIELDS) {
    const raw = String(row[field.name] ?? "");
    values[field.name] = field.type === "checks" ? raw.split(LIST_SEPARATOR).filter(Boolean) : raw;
  }
  return values;
}

export function displayName(s: { preferred_name?: string; full_name?: string }) {
  return s.preferred_name || s.full_name || "Unnamed student";
}
