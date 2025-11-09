'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserPreferences, UserProfile } from '@/lib/types';
import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePreferences = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isPreferencesLoading } = useDoc<UserProfile>(userDocRef);

    const preferences = userProfile?.preferences;
    
    useEffect(() => {
      if (preferences?.theme) {
        const theme = preferences.theme;
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "auto") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
      }
    }, [preferences?.theme])

    const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
        if (!userDocRef) return;
        
        try {
            // Use setDoc with merge to create the document if it doesn't exist,
            // or update it if it does. This is more robust.
            await setDoc(userDocRef, {
                preferences: {
                    ...(preferences || {}), // ensure existing preferences are kept
                    ...newPreferences
                }
            }, { merge: true });

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

    return { preferences, updatePreferences, isPreferencesLoading };
};
