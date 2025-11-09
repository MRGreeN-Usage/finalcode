'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserPreferences, UserProfile } from '@/lib/types';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePreferences = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const preferences = userProfile?.preferences;

    const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
        if (!userDocRef) return;
        
        try {
            await updateDoc(userDocRef, {
                preferences: {
                    ...(preferences || {}),
                    ...newPreferences
                }
            });
            toast({
                title: 'Preferences Updated',
                description: 'Your new settings have been saved.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'Could not save your preferences.',
            });
        }
    }, [userDocRef, preferences, toast]);

    return { preferences, updatePreferences };
};
