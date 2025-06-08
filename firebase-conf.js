
const firebaseConfig = {
    apiKey: "AIzaSyBJUyvuIogOqyrm629aPJSIsrUDplKzxVE",
    authDomain: "catalogo-laravel-49a76.firebaseapp.com",
    projectId: "catalogo-laravel-49a76",
    storageBucket: "catalogo-laravel-49a76.firebasestorage.app",
    messagingSenderId: "956698369387",
    appId: "1:956698369387:web:94450ab611b9673346c02e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar el storage
const storage = getStorage(app);