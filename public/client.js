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



firebase.initializeApp(firebaseConfig);

let messaging = null;


if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
    
    messaging.usePublicVapidKey(process.env.vapid);
    
    document.getElementById('requestPermission').addEventListener('click', () => {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
          initFirebaseMessaging();
        } else {
          console.log('Unable to get permission to notify');
        }
      });
    });
  } else {
    console.warn('Firebase Messaging not supported in this browser');
    document.getElementById('requestPermission').disabled = true;
    document.getElementById('sendNotification').disabled = true;
  }
  
  // Initialize Firebase Messaging
  function initFirebaseMessaging() {
    // Register the service worker
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful');
        
        // Use the service worker with Firebase Messaging
        messaging.useServiceWorker(registration);
        
        // Get FCM token
        return messaging.getToken();
      })
      .then((currentToken) => {
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          
          // Send token to your server
          fetch('/register-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: currentToken })
          })
          .then(response => response.json())
          .then(data => {
            console.log('Token registered on server:', data);
          })
          .catch(err => {
            console.error('Error registering token:', err);
          });
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((err) => {
        console.error('Error during Firebase Messaging setup:', err);
      });
  
    // Handle incoming messages when app is in foreground
    messaging.onMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/icon.png'
      };
      
      // Show notification
      new Notification(notificationTitle, notificationOptions);
    });
  }
  
  // Send test notification
  document.getElementById('sendNotification').addEventListener('click', () => {
    const title = document.getElementById('notificationTitle').value || 'Test Notification';
    const body = document.getElementById('notificationBody').value || 'This is a test notification';
    
    fetch('/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        title: title,
        body: body
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Notification sent:', data);
    })
    .catch(err => {
      console.error('Error sending notification:', err);
    });
  });
  