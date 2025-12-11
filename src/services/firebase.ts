import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your .env.local file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in failed:", error);

    let errorMessage = "Google sign-in failed";
    if (error.code) {
      switch (error.code) {
        case 'auth/unauthorized-domain':
          errorMessage = "This domain is not authorized. Please add it to the Firebase authorized domains list.";
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in window was closed by the user.";
          break;
        case 'auth/popup-blocked':
          errorMessage = "Sign-in window was blocked. Please allow popups.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign-in request was cancelled.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Invalid credentials. Please check the Firebase configuration.";
          break;
        default:
          errorMessage = `Sign-in failed: ${error.message}`;
      }
    }

    throw new Error(errorMessage);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email sign-in failed:", error);

    let errorMessage = "Email sign-in failed";
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "User not found. Check the email or sign up.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Email or password is incorrect.";
          break;
        default:
          errorMessage = `Sign-in failed: ${error.message}`;
      }
    }

    throw new Error(errorMessage);
  }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email sign-up failed:", error);

    let errorMessage = "Email sign-up failed";
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Email already in use. Please sign in instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password sign-in is not enabled.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Invalid credentials. Please check your input.";
          break;
        default:
          errorMessage = `Sign-up failed: ${error.message}`;
      }
    }

    throw new Error(errorMessage);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
