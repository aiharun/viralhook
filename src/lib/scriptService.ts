import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface SavedScript {
    id?: string;
    userId: string;
    createdAt: Timestamp | Date;
    niche: string;
    videoStyle: string;
    tone: string;
    duration: string;
    topic: string;
    selectedHook: string;
    body: string;
    callToAction: string;
    isFavorite: boolean;
    tags?: string[];
}

export interface Generation {
    id?: string;
    userId: string;
    createdAt: Timestamp | Date;
    niche: string;
    videoStyle: string;
    tone: string;
    duration: string;
    topic: string;
    scripts: {
        hook: string;
        body: string;
        callToAction: string;
    }[];
    onScreenText: {
        timing: string;
        text: string;
    }[];
    visualPrompt: string;
}

// Save a single script
export async function saveScript(scriptData: Omit<SavedScript, 'id' | 'createdAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "savedScripts"), {
            ...scriptData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving script:", error);
        throw error;
    }
}

// Get user's saved scripts
export async function getUserScripts(userId: string, limit: number = 20): Promise<SavedScript[]> {
    try {
        const q = query(
            collection(db, "savedScripts"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            firestoreLimit(limit)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavedScript));
    } catch (error) {
        console.error("Error getting scripts:", error);
        throw error;
    }
}

// Delete a script
export async function deleteScript(scriptId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "savedScripts", scriptId));
    } catch (error) {
        console.error("Error deleting script:", error);
        throw error;
    }
}

// Toggle favorite status
export async function toggleFavorite(scriptId: string, isFavorite: boolean): Promise<void> {
    try {
        await updateDoc(doc(db, "savedScripts", scriptId), {
            isFavorite: !isFavorite
        });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
    }
}

// Save full generation
export async function saveGeneration(generationData: Omit<Generation, 'id' | 'createdAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "generations"), {
            ...generationData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving generation:", error);
        throw error;
    }
}

// Get user's generation history
export async function getUserGenerations(userId: string, limit: number = 20): Promise<Generation[]> {
    try {
        const q = query(
            collection(db, "generations"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            firestoreLimit(limit)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Generation));
    } catch (error) {
        console.error("Error getting generations:", error);
        throw error;
    }
}

// Delete a generation
export async function deleteGeneration(generationId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "generations", generationId));
    } catch (error) {
        console.error("Error deleting generation:", error);
        throw error;
    }
}
