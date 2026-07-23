import { supabase } from './lib/supabase';

// ============================================================================
// Conversion camelCase (JS) <-> snake_case (colonnes Postgres/Supabase)
// ============================================================================
// Les tables Supabase de ce projet utilisent des noms de colonnes en
// snake_case (ex: "price_per_day"), alors que tout le code JavaScript/React
// utilise du camelCase (ex: "pricePerDay"). Plutôt que de renommer les
// colonnes ou de changer tout le code, on convertit automatiquement entre les
// deux formats ici, au même endroit pour toutes les tables.
const camelToSnake = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const snakeToCamel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());

function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[camelToSnake(key)] = obj[key];
  }
  return result;
}

function objectToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[snakeToCamel(key)] = obj[key];
  }
  return result;
}

function arrayToCamelCase<T>(rows: any[] | null): T[] {
  return (rows || []).map((row) => objectToCamelCase(row)) as T[];
}

// Téléverse un fichier (photo, vidéo, audio) vers Supabase Storage (bucket
// "media") et renvoie son URL publique. C'est CETTE url (une simple chaîne de
// caractères) qui est ensuite stockée dans la table Supabase — jamais le
// fichier lui-même. Gratuit jusqu'à 1 Go de stockage / 2 Go de bande passante
// par mois, sans carte bancaire requise.
//
// onProgress (optionnel) est appelé régulièrement avec un pourcentage (0-100),
// pour afficher une vraie barre de progression pendant l'envoi.
export async function uploadFileToStorage(
  file: File | Blob,
  folder: string,
  fileName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const safeName = fileName || (file instanceof File ? file.name : `fichier-${Date.now()}`);
  const path = `${folder}/${Date.now()}-${safeName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.total > 0) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from('media').getPublicUrl(path);
        resolve(data.publicUrl);
      } else {
        reject(new Error(`Échec de l'envoi vers Supabase Storage (code ${xhr.status}): ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Échec de l\'envoi vers Supabase Storage (erreur réseau).'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Envoi annulé.'));
    });

    xhr.open('POST', uploadUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    const contentType = file instanceof File ? file.type || 'application/octet-stream' : 'application/octet-stream';
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(file);
  });
}

export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(collectionName)
    .select('*');

  if (error) {
    throw new Error(`Échec du chargement de "${collectionName}": ${error.message}`);
  }

  return arrayToCamelCase<T>(data);
}

export function subscribeCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
) {
  const channel = supabase
    .channel(`realtime:${collectionName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: collectionName },
      () => {
        supabase
          .from(collectionName)
          .select('*')
          .then(({ data, error }) => {
            if (!error && data) {
              callback(arrayToCamelCase<T>(data));
            }
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function addDocument(
  collectionName: string,
  data: any
) {
  const { data: insertedData, error } = await supabase
    .from(collectionName)
    .insert([objectToSnakeCase(data)])
    .select();

  if (error) {
    throw new Error(`Échec de l'ajout dans "${collectionName}": ${error.message}`);
  }

  const row = insertedData?.[0];
  return row ? objectToCamelCase(row) : row;
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: any
) {
  const { data: updatedData, error } = await supabase
    .from(collectionName)
    .update(objectToSnakeCase(data))
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Échec de la mise à jour dans "${collectionName}": ${error.message}`);
  }

  const row = updatedData?.[0];
  return row ? objectToCamelCase(row) : row;
}

export async function deleteDocument(
  collectionName: string,
  id: string
) {
  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Échec de la suppression dans "${collectionName}": ${error.message}`);
  }
}

export async function saveCollection(
  collectionName: string,
  data: any[]
) {
  if (data.length === 0) return;
  const { error } = await supabase
    .from(collectionName)
    .upsert(data.map(objectToSnakeCase), { onConflict: 'id' });

  if (error) {
    throw new Error(`Échec de l'enregistrement dans "${collectionName}": ${error.message}`);
  }
}
