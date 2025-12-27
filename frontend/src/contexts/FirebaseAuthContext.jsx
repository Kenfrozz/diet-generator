// Firebase Authentication Context
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUser, updateUser } from '../lib/firestoreService';

const FirebaseAuthContext = createContext(null);

export function FirebaseAuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Kullanıcı profil bilgilerini Firestore'dan al
        try {
          const profile = await getUser(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password ile giriş
  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Çıkış yap
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Profil güncelle
  const updateProfile = async (profileData) => {
    if (!firebaseUser) return;
    
    try {
      await updateUser(firebaseUser.uid, profileData);
      setUserProfile(prev => ({ ...prev, ...profileData }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    firebaseUser,
    userProfile,
    loading,
    error,
    signInWithEmail,
    signOut,
    updateProfile,
    isAuthenticated: !!firebaseUser,
    uid: firebaseUser?.uid || null
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

export default FirebaseAuthContext;
