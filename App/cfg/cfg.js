import {
    LOCALHOST,
    PORT,
    GOOGLE_MAPS_API_KEY,
    GOOGLE_WEB_ID,
    AMPLITUDE_API_KEY,
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID
  } from '@env';
  
  export default {
    localhost: LOCALHOST,
    port: PORT,
    maps: GOOGLE_MAPS_API_KEY,
    web_id: GOOGLE_WEB_ID,
    amplitude: AMPLITUDE_API_KEY,
    firebase: {
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
      measurementId: FIREBASE_MEASUREMENT_ID,
    }
  };
  