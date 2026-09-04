import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { Singer, Song, Album, Award, NewsArticle } from "../types";

export interface SaveGamePayload {
  singer: Singer;
  discography: Song[];
  albums: Album[];
  awards: Award[];
  news: NewsArticle[];
  updatedAt?: any;
  createdAt?: any;
}

const LOCAL_STORAGE_KEY = "singer_simulator_saved_game";

export const saveCareerToFirestore = async (
  userId: string,
  payload: SaveGamePayload
): Promise<{ success: boolean; isLocalFallback?: boolean; error?: string }> => {
  // Always save locally first for instant offline backup
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...payload,
      localSavedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }

  if (!isFirebaseConfigured()) {
    return { success: true, isLocalFallback: true };
  }

  try {
    const careerDocRef = doc(db, "users", userId, "careers", payload.singer.id);
    
    // Save to Firestore matching security rules
    await setDoc(careerDocRef, {
      singerName: payload.singer.artistName,
      realName: payload.singer.realName,
      age: payload.singer.age,
      nationality: payload.singer.nationality,
      genre: payload.singer.genre,
      stats: payload.singer.stats,
      bzrpDone: payload.singer.bzrpSessionCompleted,
      singerData: payload.singer,
      discography: payload.discography,
      albums: payload.albums,
      awards: payload.awards,
      news: payload.news.slice(0, 50),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving to Firestore:", error);
    return { success: false, error: error.message };
  }
};

export const loadCareerFromFirestore = async (
  userId?: string
): Promise<SaveGamePayload | null> => {
  if (userId && isFirebaseConfigured()) {
    try {
      const careersCol = collection(db, "users", userId, "careers");
      const snap = await getDocs(careersCol);
      if (!snap.empty) {
        const firstDoc = snap.docs[0].data();
        return {
          singer: firstDoc.singerData,
          discography: firstDoc.discography || [],
          albums: firstDoc.albums || [],
          awards: firstDoc.awards || [],
          news: firstDoc.news || []
        };
      }
    } catch (err) {
      console.warn("Failed to load from Firestore, checking local backup...", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse local save", e);
  }

  return null;
};
