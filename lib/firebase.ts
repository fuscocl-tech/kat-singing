import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Public web app config: it identifies the project, it isn't a secret.
// Access to student data is controlled by firestore.rules.
const firebaseConfig = {
  apiKey: "AIzaSyCOj_HZTxM8xrLs2jQV0n9opgsxBD8_AiQ",
  authDomain: "kat-singing.firebaseapp.com",
  projectId: "kat-singing",
  storageBucket: "kat-singing.firebasestorage.app",
  messagingSenderId: "230577828324",
  appId: "1:230577828324:web:e0eada0f51979b1f2117f1",
};

const firstLoad = getApps().length === 0;
const app = firstLoad ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

if (firstLoad && process.env.NEXT_PUBLIC_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  // Emulator only: sign in as any Google address from the browser console without the pop-up,
  // e.g. emulatorSignIn("someone@gmail.com"). Useful for testing who can see what.
  // (Pages are also pre-rendered on the server, where there is no window.)
  if (typeof window !== "undefined") Object.assign(window, {
    emulatorSignIn: (email: string) =>
      signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true }))),
  });
}
