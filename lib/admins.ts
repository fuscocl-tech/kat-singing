// Google accounts allowed into the CRM. firestore.rules enforces the same list —
// after editing, run `npm run rules` and deploy the rules (see README).
export const ADMIN_EMAILS: string[] = [
  "fuscocl@gmail.com",
  "katfusco@gmail.com",
];

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
