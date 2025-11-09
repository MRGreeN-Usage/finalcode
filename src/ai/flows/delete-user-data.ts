'use server';
/**
 * @fileOverview A Genkit flow to recursively delete a user's data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';
import {initializeApp, getApps, cert} from 'firebase-admin/app';

// Define the input schema for the flow.
export const DeleteUserDataInputSchema = z.object({
  userId: z.string().describe('The UID of the user whose data should be deleted.'),
});
export type DeleteUserDataInput = z.infer<typeof DeleteUserDataInputSchema>;

// Initialize Firebase Admin SDK if it hasn't been already.
if (!getApps().length) {
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
        initializeApp({
            credential: cert(serviceAccount)
        });
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK. Make sure GOOGLE_APPLICATION_CREDENTIALS is set.", e);
    }
}


// Export a wrapper function that can be called from the client.
export async function deleteUserData(input: DeleteUserDataInput): Promise<{ success: boolean; message: string }> {
  return deleteUserDataFlow(input);
}


// Define the Genkit flow.
export const deleteUserDataFlow = ai.defineFlow(
  {
    name: 'deleteUserDataFlow',
    inputSchema: DeleteUserDataInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ userId }) => {
    if (!userId) {
      return { success: false, message: 'User ID is required.' };
    }

    try {
        const db = getFirestore();
        console.log(`Starting deletion for user: ${userId}`);

        // Firestore Admin SDK does not support recursive deletion directly.
        // We need to delete subcollections manually.
        const collections = ['transactions', 'budgets', 'categories', 'monthlySummaries'];
        for (const collectionName of collections) {
            const collectionPath = `users/${userId}/${collectionName}`;
            console.log(`Deleting collection: ${collectionPath}`);
            const snapshot = await db.collection(collectionPath).get();
            if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
            }
        }

        // Finally, delete the user's main document.
        const userDocRef = db.doc(`users/${userId}`);
        await userDocRef.delete();
        console.log(`Deleted user document: users/${userId}`);

        return { success: true, message: `Successfully deleted all data for user ${userId}.` };
    } catch (error: any) {
      console.error(`Failed to delete data for user ${userId}:`, error);
      // It's important to throw the error so the client can catch it.
      throw new Error(error.message || 'An unexpected error occurred during data deletion.');
    }
  }
);
