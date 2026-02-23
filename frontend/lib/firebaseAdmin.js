import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getMasterApiConfig } from './masterApiConfig';

const cfg = getMasterApiConfig();

const app = getApps()[0] || initializeApp({
  credential: cert({
    projectId: cfg.firebase.projectId,
    clientEmail: cfg.firebase.clientEmail,
    privateKey: cfg.firebase.privateKey
  }),
  storageBucket: cfg.firebase.storageBucket
});

export const db = getFirestore(app);
export const storage = getStorage(app).bucket();
