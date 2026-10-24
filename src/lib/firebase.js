import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBHokk6hyJDpNeUKh_klRlhSawLJyoHtaU",
  authDomain: "hackathon-test-1af00.firebaseapp.com",
  projectId: "hackathon-test-1af00",
  storageBucket: "hackathon-test-1af00.firebasestorage.app",
  messagingSenderId: "5417781015",
  appId: "1:5417781015:web:478fd63d5ee1d6ac405952",
  measurementId: "G-0P4CK63XQB"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === 'secondary')
  const secondary = existing || initializeApp(firebaseConfig, 'secondary')
  return getAuth(secondary)
}