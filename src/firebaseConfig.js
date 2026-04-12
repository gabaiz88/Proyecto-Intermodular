import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeUr20TK02O33k5uZ34QuxSXTnqvEDIEA",
  authDomain: "recambiosclick-5dc43.firebaseapp.com",
  projectId: "recambiosclick-5dc43",
  storageBucket: "recambiosclick-5dc43.firebasestorage.app",
  messagingSenderId: "10968466518",
  appId: "1:10968466518:web:0e17cc23b4d8599a3467f7"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos para usarla en App.jsx
export const db = getFirestore(app);