import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "./firebase";

// Téléverse un fichier (photo, vidéo, audio) vers Firebase Storage et renvoie
// son URL de téléchargement publique. C'est CETTE url (une simple chaîne de
// caractères, quelques dizaines d'octets) qui est ensuite stockée dans le
// document Firestore — jamais le fichier lui-même. Cela évite la limite
// stricte de 1 Mo par document Firestore, qui faisait échouer silencieusement
// l'enregistrement des photos et surtout des vidéos.
export async function uploadFileToStorage(
  file: File | Blob,
  folder: string,
  fileName?: string
): Promise<string> {
  const safeName = fileName || (file instanceof File ? file.name : `fichier-${Date.now()}`);
  const path = `${folder}/${Date.now()}-${safeName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

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