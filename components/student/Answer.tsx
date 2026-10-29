import { formatDate } from "@/lib/config";
import { ALL_FIELDS, FORM_SECTIONS, LIST_SEPARATOR, type Field } from "@/lib/student-form";
import type { StudentInput } from "@/lib/student-form";

const LINK_PREFIX: Record<string, string> = { email: "mailto:", tel: "tel:" };
const FIELDS_BY_NAME = new Map(ALL_FIELDS.map((f) => [f.name, f]));

export function fieldNamed(name: string) {
  return FIELDS_BY_NAME.get(name)!;
}

/** One answer in a definition list, formatted for its field type. */
export function AnswerRow({
  field,
  value,
  label = field.label,
  wide = false,
}: {
  field: Field;
  value: string;
  label?: string;
  /** Spans both columns of a .dl-grid. */
  wide?: boolean;
}) {
  const prefix = LINK_PREFIX[field.type];
  return (
    <div className={`dl-row${wide ? " span-2" : ""}`}>
      <dt>{label}</dt>
      <dd className="prewrap">
        {field.type === "checks" ? (
          <ul className="ticks">
            {value.split(LIST_SEPARATOR).map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        ) : field.type === "date" ? (
          formatDate(value)
        ) : prefix ? (
          <a href={`${prefix}${value}`}>{value}</a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/** Every intake answer, section by section, as the student filled it in. */
export function IntakeAnswers({ answers }: { answers: StudentInput }) {
  return (
    <div className="stack">
      {FORM_SECTIONS.map((section) => {
        const answered = section.fields.filter((f) => answers[f.name]);
        return (
          <section key={section.title} className={`card${section.sensitive && answered.length ? " highlight" : ""}`}>
            <h2>{section.title}</h2>
            {answered.length === 0 ? (
              <p className="muted">Nothing provided.</p>
            ) : (
              <dl className="dl">
                {answered.map((f) => (
                  <AnswerRow key={f.name} field={f} value={answers[f.name]} />
                ))}
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}
