import { getFirestoreClient, saveDocument } from './firebase';

// Note: In browser environments, RTCPeerConnection is global. This file
// provides a Firestore-based signalling helper. It only runs when Firebase configured.

export async function startCallFirestore(callId: string, localStream: MediaStream, onRemoteStream: (s: MediaStream) => void) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // attach local tracks
  for (const track of localStream.getTracks()) pc.addTrack(track, localStream);

  const remoteStream = new MediaStream();
  pc.ontrack = (ev) => {
    ev.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
    onRemoteStream(remoteStream);
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // save offer in Firestore call document
  await saveDocument('calls', callId, { offer: offer.sdp, offerType: offer.type, status: 'offered', createdAt: new Date().toISOString() });

  // listen for answer via polling - simplified approach
  const answerCheck = setInterval(async () => {
    try {
      const snap = await (await import('firebase/firestore')).getDoc((await import('firebase/firestore')).doc(db, 'calls', callId));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.answer) {
          const desc: RTCSessionDescriptionInit = { type: data.answerType ?? 'answer', sdp: data.answer };
          await pc.setRemoteDescription(desc as any);
          clearInterval(answerCheck);
        }
      }
    } catch (e) {
      console.warn('poll error', e);
    }
  }, 1000);

  return { pc, remoteStream };
}

export async function answerCallFirestore(callId: string, localStream: MediaStream, onRemoteStream: (s: MediaStream) => void) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');

  const docRef = (await import('firebase/firestore')).doc(db, 'calls', callId);
  const snap = await (await import('firebase/firestore')).getDoc(docRef);
  if (!snap.exists()) throw new Error('Call not found');
  const data = snap.data() as any;
  if (!data.offer) throw new Error('No offer present');

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  for (const track of localStream.getTracks()) pc.addTrack(track, localStream);

  const remoteStream = new MediaStream();
  pc.ontrack = (ev) => {
    ev.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
    onRemoteStream(remoteStream);
  };

  const desc: RTCSessionDescriptionInit = { type: data.offerType ?? 'offer', sdp: data.offer };
  await pc.setRemoteDescription(desc as any);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // save answer
  await saveDocument('calls', callId, { answer: answer.sdp, answerType: answer.type, status: 'answered', answeredAt: new Date().toISOString() });

  return { pc, remoteStream };
}
