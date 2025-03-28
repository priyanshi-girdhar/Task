// Import Firebase Scripts 
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");
// Your Firebase Config 
require("dotenv").config();
const firebaseConfig = {
    
    apiKey: process.env.apiKey,
    
    authDomain: process.env.authDomain,
    
    projectId: process.env.projectId,
    
    storageBucket: process.env.storageBucket,
    
    messagingSenderId:process.env.messagingSenderId,
    
    appId: process.env.appId,
    
    measurementId: process.env.measurementId
    
};
// Initialize Firebase 
firebase.initializeApp(firebaseConfig);
// Initialize Messaging 
const messaging = firebase.messaging();
// Handle Background Messages 
messaging.setBackgroundMessageHandler((payload) => {
    console.log(" Background message received:", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
    });
});