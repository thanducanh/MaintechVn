import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      console.warn("Firebase Admin credentials missing. Push notifications will be disabled.");
    }
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : {
  sendEachForMulticast: async () => ({
    responses: [],
    successCount: 0,
    failureCount: 0,
  })
} as any;

export default admin;
