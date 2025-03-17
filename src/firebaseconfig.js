import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC_ya9Ayfm0xYr0XJXXBNNgQvgvUCPVZ60",
    authDomain: "taskflow-ai-a2dcb.firebaseapp.com",
    projectId: "taskflow-ai-a2dcb",
    storageBucket: "taskflow-ai-a2dcb.firebasestorage.app",
    messagingSenderId: "72547396945",
    appId: "1:72547396945:web:b861f0d86176eac96db770"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
