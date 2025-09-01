// auth.js
function onSignIn(googleUser) {
    // Получаем базовую информацию о профиле
    var profile = googleUser.getBasicProfile();
    
    // Сохраняем данные пользователя
    localStorage.setItem('userID', profile.getId());
    localStorage.setItem('userName', profile.getName());
    localStorage.setItem('userAvatar', profile.getImageUrl());
    localStorage.setItem('userEmail', profile.getEmail());
    
    // Показываем основное приложение
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Обновляем информацию пользователя в интерфейсе
    document.getElementById('userName').textContent = profile.getName();
    document.getElementById('userAvatar').src = profile.getImageUrl();
    
    // Загружаем данные пользователя
    loadUserData();
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        // Очищаем localStorage
        localStorage.clear();
        
        // Показываем экран аутентификации
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
    });
}

// Проверяем, вошел ли пользователь ранее
function checkAuth() {
    const userID = localStorage.getItem('userID');
    if (userID) {
        // Если пользователь уже вошел, показываем приложение
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        // Обновляем информацию пользователя
        document.getElementById('userName').textContent = localStorage.getItem('userName');
        document.getElementById('userAvatar').src = localStorage.getItem('userAvatar');
        
        // Загружаем данные пользователя
        loadUserData();
    }
}

// Загружаем данные пользователя
function loadUserData() {
    // Загружаем почасовую ставку
    const hourlyRate = localStorage.getItem('hourlyRate') || '';
    document.getElementById('hourlyRate').value = hourlyRate;
    
    // Загружаем историю работы
    loadWorkHistory();
}

// Инициализация при загрузке страницы
window.onload = function() {
    checkAuth();
};