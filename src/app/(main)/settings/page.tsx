'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { usePreferences } from '@/firebase/firestore/use-preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { updateProfile, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Currency, Theme } from '@/lib/types';
import { useRouter } from 'next/navigation';


export default function SettingsPage() {
    const { user } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const { preferences, updatePreferences, isPreferencesLoading } = usePreferences();

    const [name, setName] = useState(user?.displayName || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [currency, setCurrency] = useState<Currency>('USD');
    const [theme, setTheme] = useState<Theme>('auto');
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setName(user.displayName);
        }
    }, [user?.displayName]);
    
    useEffect(() => {
        if (preferences) {
            setCurrency(preferences.currency || 'USD');
            setTheme(preferences.theme || 'auto');
        }
    }, [preferences]);

    const handleSaveProfile = async () => {
        if (!user || !auth?.currentUser || !firestore) return;
        setIsSavingProfile(true);
        try {
            await updateProfile(auth.currentUser, { displayName: name });
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { name: name });

            toast({
                title: 'Profile Updated',
                description: 'Your name has been successfully updated.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsSavingProfile(false);
        }
    };
    
    const handleSavePreferences = async () => {
        setIsSavingPrefs(true);
        await updatePreferences({ currency, theme });
        setIsSavingPrefs(false);
    }

    const handleChangePassword = async () => {
        if (!user?.email || !auth) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No email address found for your account.',
            });
            return;
        }
        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: 'Password Reset Email Sent',
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleClearData = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.' });
            return;
        }
        setIsDeleting(true);
        
        try {
            const collectionsToDelete = ['transactions', 'budgets', 'categories', 'monthlySummaries'];
            
            for (const collectionName of collectionsToDelete) {
                const collectionRef = collection(firestore, 'users', user.uid, collectionName);
                const snapshot = await getDocs(collectionRef);
                const batch = writeBatch(firestore);
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            // Finally, delete the user's main document.
            const userDocRef = doc(firestore, 'users', user.uid);
            await deleteDoc(userDocRef);

            toast({
                title: 'Data Deletion Complete',
                description: 'Your data has been successfully cleared. You will now be logged out.',
            });

            // Wait a moment for the toast to be seen, then log out.
            setTimeout(async () => {
                if(auth) {
                    await signOut(auth);
                    router.push('/login');
                }
            }, 3000);

        } catch (error: any) {
            console.error("Data deletion failed:", error);
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'There was an error deleting your data. Please try again.',
            });
            setIsDeleting(false);
        }
    }
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSavingProfile}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ''} disabled />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Profile
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                     <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)} disabled={isPreferencesLoading}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                                <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={(v) => setTheme(v as Theme)} disabled={isPreferencesLoading}>
                            <SelectTrigger id="theme">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light Mode</SelectItem>
                                <SelectItem value="dark">Dark Mode</SelectItem>
                                <SelectItem value="auto">System Default</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <Button onClick={handleSavePreferences} disabled={isSavingPrefs || isPreferencesLoading}>
                        {(isSavingPrefs || isPreferencesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                     </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={handleChangePassword} disabled={isSendingReset}>
                        {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Change Password
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Clear all your expense data. This action cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Clear All Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all your transactions, budgets, and other associated data from the server.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearData} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Yes, Clear Everything'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

        </div>
    );
}
