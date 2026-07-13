import { storage } from './init.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

export async function uploadProfilePicture(uid, file) {
  const fileRef = ref(storage, `users/${uid}/avatar/${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}
