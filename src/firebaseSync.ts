import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

export function subscribeCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]
    );
  });
}

export async function addDocument(
  collectionName: string,
  data: any
) {
  return addDoc(collection(db, collectionName), data);
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: any
) {
  return setDoc(doc(db, collectionName, id), data, {
    merge: true,
  });
}

export async function deleteDocument(
  collectionName: string,
  id: string
) {
  return deleteDoc(doc(db, collectionName, id));
}

export async function saveCollection(
  collectionName: string,
  data: any[]
) {
  for (const item of data) {
    await setDoc(doc(db, collectionName, item.id), item);
  }
}