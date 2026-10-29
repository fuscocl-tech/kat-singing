import "server-only";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// On Firebase App Hosting credentials come from the environment automatically.
// Locally, use the Firestore emulator (FIRESTORE_EMULATOR_HOST) or a service account
// key (GOOGLE_APPLICATION_CREDENTIALS) — see the README.
const app = getApps()[0] ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "kat-singing" });

export const db = getFirestore(app);
