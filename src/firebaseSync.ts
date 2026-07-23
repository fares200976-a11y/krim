import { supabase } from './lib/supabase';

// Uploads a file (photo, video, audio) to Cloudinary and returns its URL.
// The URL (a simple string) is then stored in the Supabase document — never 
// the file itself. This avoids the strict 1 MB per document limit that would
// cause silent failures with photos and especially videos.
//
// onProgress (optional) is called regularly with a percentage (0-100) to display
// a real progress bar during upload — useful for videos/audio that may take time.
export async function uploadFileToStorage(
  file: File | Blob,
  folder: string,
  fileName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudinaryUrl || !cloudinaryUploadPreset) {
    throw new Error(
      'Cloudinary configuration is missing. Please set VITE_CLOUDINARY_URL and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryUploadPreset);
  formData.append('folder', `karim/${folder}`);

  const safeName = fileName || (file instanceof File ? file.name : `fichier-${Date.now()}`);
  formData.append('public_id', `${Date.now()}-${safeName.replace(/[^a-zA-Z0-9._-]/g, '_')}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.total > 0) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Cloudinary upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Cloudinary upload was aborted'));
    });

    xhr.open('POST', cloudinaryUrl, true);
    xhr.send(formData);
  });
}

export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(collectionName)
    .select('*');

  if (error) {
    throw new Error(`Failed to load collection "${collectionName}": ${error.message}`);
  }

  return (data || []) as T[];
}

export function subscribeCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
) {
  const subscription = supabase
    .from(collectionName)
    .on('*', (payload) => {
      // Fetch fresh data on any change to ensure consistency
      supabase
        .from(collectionName)
        .select('*')
        .then(({ data, error }) => {
          if (!error && data) {
            callback(data as T[]);
          }
        });
    })
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeSubscription(subscription);
  };
}

export async function addDocument(
  collectionName: string,
  data: any
) {
  const { data: insertedData, error } = await supabase
    .from(collectionName)
    .insert([data])
    .select();

  if (error) {
    throw new Error(`Failed to add document to "${collectionName}": ${error.message}`);
  }

  return insertedData?.[0];
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: any
) {
  const { data: updatedData, error } = await supabase
    .from(collectionName)
    .update(data)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Failed to update document in "${collectionName}": ${error.message}`);
  }

  return updatedData?.[0];
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
    throw new Error(`Failed to delete document from "${collectionName}": ${error.message}`);
  }
}

export async function saveCollection(
  collectionName: string,
  data: any[]
) {
  for (const item of data) {
    const { error } = await supabase
      .from(collectionName)
      .upsert([item], { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save item to "${collectionName}": ${error.message}`);
    }
  }
}
