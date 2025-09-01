// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Состояние приложения
let state = {
    currentUser: null,
    timerInterval: null,
    startTime: null,
    currentSession: null,
    hourlyRate: 1500 // Ставка по умолчанию
};

// Элементы DOM
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const googleLoginBtn = document.getElementById('googleLogin');
const logoutBtn = document.getElementById('logoutBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timerDisplay');
const earningsDisplay = document.getElementById('earningsDisplay');

// Аутентификация через Google
googleLoginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            state.currentUser = result.user;
            loadUserData();
        })
        .catch((error) => {
            console.error("Ошибка аутентификации: ", error);
        });
});

// Выход
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    state.currentUser = null;
});

// Отслеживание состояния аутентификации
auth.onAuthStateChanged((user) => {
    if (user) {
        state.currentUser = user;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadUserData();
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});

// Загрузка данных пользователя
function loadUserData() {
    db.collection('users').doc(state.currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.hourlyRate) {
                    state.hourlyRate = data.hourlyRate;
                }
                // Загрузка других данных...
            }
        })
        .catch((error) => {
            console.error("Ошибка загрузки данных: ", error);
        });
}