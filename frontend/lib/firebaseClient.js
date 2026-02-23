import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMasterApiConfig } from './masterApiConfig';

const cfg = getMasterApiConfig();
const firebaseConfig = {
  apiKey: cfg.firebase.apiKey,
  authDomain: cfg.firebase.authDomain,
  projectId: cfg.firebase.projectId,
  storageBucket: cfg.firebase.storageBucket,
  messagingSenderId: cfg.firebase.messagingSenderId,
  appId: cfg.firebase.appId
};

const app = getApps()[0] || initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const fileStorage = getStorage(app);
