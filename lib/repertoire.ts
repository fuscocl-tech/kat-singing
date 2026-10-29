import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { iso } from "./students";

// Firestore layout (admin-only, see firestore.rules):
//   students/{id}/songs/{id}       { title, artist, list, link, notes, createdAt }
//   students/{id}/resources/{id}   { title, url, kind, notes, createdAt }

export const SONG_LISTS = [
  { value: "current", label: "Currently singing" },
  { value: "suggested", label: "Suggested for later" },
  { value: "learned", label: "Learned" },
] as const;

export type SongList = (typeof SONG_LISTS)[number]["value"];

export const RESOURCE_KINDS = [
  { value: "sheet", label: "Sheet music" },
  { value: "backing", label: "Backing track" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Recording / audio" },
  { value: "lyrics", label: "Lyrics" },
  { value: "exercise", label: "Exercise" },
  { value: "other", label: "Other" },
] as const;

export type Song = { id: string; created_at: string; title: string; artist: string; list: SongList; link: string; notes: string };
export type Resource = { id: string; created_at: string; title: string; url: string; kind: string; notes: string };

const songsOf = (studentId: string) => collection(db, "students", studentId, "songs");
const resourcesOf = (studentId: string) => collection(db, "students", studentId, "resources");

/** Adds https:// when missing; returns "" for anything that isn't a web link. */
export function normaliseUrl(value: string) {
  const text = value.trim();
  if (!text) return "";
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

export async function listSongs(studentId: string) {
  const snapshot = await getDocs(query(songsOf(studentId), orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      created_at: iso(data.createdAt),
      title: data.title ?? "",
      artist: data.artist ?? "",
      list: data.list ?? "current",
      link: data.link ?? "",
      notes: data.notes ?? "",
    } as Song;
  });
}

export async function addSong(studentId: string, song: Omit<Song, "id" | "created_at">) {
  await addDoc(songsOf(studentId), { ...song, createdAt: serverTimestamp() });
}

export async function moveSong(studentId: string, songId: string, list: SongList) {
  await updateDoc(doc(songsOf(studentId), songId), { list });
}

export async function deleteSong(studentId: string, songId: string) {
  await deleteDoc(doc(songsOf(studentId), songId));
}

export async function listResources(studentId: string) {
  const snapshot = await getDocs(query(resourcesOf(studentId), orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      created_at: iso(data.createdAt),
      title: data.title ?? "",
      url: data.url ?? "",
      kind: data.kind ?? "other",
      notes: data.notes ?? "",
    } as Resource;
  });
}

export async function addResource(studentId: string, resource: Omit<Resource, "id" | "created_at">) {
  await addDoc(resourcesOf(studentId), { ...resource, createdAt: serverTimestamp() });
}

export async function deleteResource(studentId: string, resourceId: string) {
  await deleteDoc(doc(resourcesOf(studentId), resourceId));
}
