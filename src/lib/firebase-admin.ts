import { cert, getApps, initializeApp } from "firebase-admin/app";
import {
  getMessaging,
  type Messaging
} from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : projectId && clientEmail && privateKey
      ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          })
        })
      : null;

export const adminMessaging: Messaging | null = firebaseAdminApp
  ? getMessaging(firebaseAdminApp)
  : null;