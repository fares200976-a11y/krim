import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { saveCollection } from "./firebaseSync";

// Outil de migration à usage unique : copie toutes les données existantes de
// l'ancienne base Firestore vers les nouvelles tables Supabase. À utiliser UNE
// SEULE FOIS après avoir créé les tables (voir supabase-schema.sql), pour ne
// pas perdre les réservations/robes/etc. déjà enregistrées avant le changement
// de système.
//
// Sans danger à relancer plusieurs fois : utilise un upsert (met à jour si
// l'id existe déjà, sinon crée), donc ça n'écrase jamais rien d'autre et ne
// duplique pas les données.
const COLLECTIONS = ["dresses", "bookings", "team", "testimonials", "videos", "settings"];

export interface MigrationResult {
  collection: string;
  count: number;
  error?: string;
}

export async function migrateFromFirestore(
  onProgress?: (message: string) => void
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  for (const collectionName of COLLECTIONS) {
    onProgress?.(`Lecture de "${collectionName}" depuis Firestore...`);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (items.length === 0) {
        results.push({ collection: collectionName, count: 0 });
        onProgress?.(`"${collectionName}" : aucune donnée trouvée dans Firestore.`);
        continue;
      }

      onProgress?.(`Envoi de ${items.length} élément(s) de "${collectionName}" vers Supabase...`);
      await saveCollection(collectionName, items);
      results.push({ collection: collectionName, count: items.length });
      onProgress?.(`✓ "${collectionName}" migré (${items.length} élément(s)).`);
    } catch (error: any) {
      console.error(`Échec de la migration de "${collectionName}"`, error);
      results.push({ collection: collectionName, count: 0, error: error.message || String(error) });
      onProgress?.(`⚠️ Échec pour "${collectionName}" : ${error.message || error}`);
    }
  }

  return results;
}
