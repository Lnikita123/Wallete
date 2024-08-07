import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCs-1K6Ylk03ZZcDKncXliqjHi5Xq5LHO0",
    authDomain: "neptunes-429309.firebaseapp.com",
    projectId: "neptunes-429309",
    storageBucket: "neptunes-429309.appspot.com",
    messagingSenderId: "336264573435",
    appId: "1:336264573435:web:8f515bd1348a0422115b5e",
    measurementId: "G-Z8N82G1FRL"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
