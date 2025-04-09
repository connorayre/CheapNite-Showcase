import { initializeApp } from '@firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const cfg = require('./cfg/cfg'); // Adjust the path as needed

const app = initializeApp(cfg.firebase);


let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  console.error("Error initializing auth with persistence:", error);
}

const db = getFirestore(app);

export { auth, db };
