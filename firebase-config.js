// Firebase configuration
const firebaseConfig = {
    // You'll need to replace these with your actual Firebase project credentials
    apiKey: "AIzaSyC-nk2AalkFLZWrcOLm_ON6Cu9Gld8XbFg",
    authDomain: "alaz2025.firebaseapp.com",
    projectId: "alaz2025",
    storageBucket: "alaz2025.firebasestorage.app",
    messagingSenderId: "1002861011923",
    appId: "1:1002861011923:web:040214afddc41a180b4526",
    measurementId: "G-PXZSBN1V78"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.log('Persistence failed - multiple tabs open');
        } else if (err.code == 'unimplemented') {
            // The current browser doesn't support persistence
            console.log('Persistence not supported in this browser');
        }
    });
