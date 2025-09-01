// app.js
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isTimerRunning = false;

// Элементы интерфейса
const currentTimerElement = document.getElementById('currentTimer');
const currentEarningsElement = document.getElementById('currentEarnings');
const todayTimeElement = document.getElementById('todayTime');
const startButton = document.getElementById('startTimer');
const stopButton = document.getElementById('stopTimer');

// Запуск таймера
function startTimer() {
    if (isTimerRunning) return;
    
    startTime = new Date();
    isTimerRunning = true;
    
    // Обновляем UI
    startButton.disabled = true;
    stopButton.disabled = false;
    
    // Запускаем интервал обновления времени
    timerInterval = setInterval(updateTimer, 1000);
    
    // Сохраняем время начала
    localStorage.setItem('timerStartTime', startTime.toISOString());
}

// Остановка таймера
function stopTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    // Обновляем UI
    startButton.disabled = false;
    stopButton.disabled = true;
    
    // Сохраняем сеанс работы
    saveWorkSession();
    
    // Сбрасываем таймер
    currentTimerElement.textContent = '00:00:00';
    elapsedTime = 0;
    
    // Удаляем время начала из localStorage
    localStorage.removeItem('timerStartTime');
}

// Обновление отображения таймера
function updateTimer() {
    const now = new Date();
    elapsedTime = Math.floor((now - startTime) / 1000);
    
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    currentTimerElement.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновляем текущий заработок
    updateCurrentEarnings();
}

// Обновление текущего заработка
function updateCurrentEarnings() {
    const hourlyRate = parseFloat(localStorage.getItem('hourlyRate')) || 0;
    if (hourlyRate > 0) {
        const earnings = (elapsedTime / 3600) * hourlyRate;
        currentEarningsElement.textContent = `${earnings.toFixed(2)} ₽`;
    }
}

// Сохранение сеанса работы
function saveWorkSession() {
    const endTime = new Date();
    const duration = elapsedTime;
    const hourlyRate = parseFloat(localStorage.getItem('hourlyRate')) || 0;
    const earnings = (duration / 3600) * hourlyRate;
    
    // Создаем объект сеанса
    const session = {
        date: startTime.toISOString().split('T')[0],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        earnings: earnings
    };
    
    // Получаем существующую историю
    let workHistory = JSON.parse(localStorage.getItem('workHistory')) || [];
    
    // Добавляем новый сеанс
    workHistory.push(session);
    
    // Сохраняем обновленную историю
    localStorage.setItem('workHistory', JSON.stringify(workHistory));
    
    // Обновляем статистику
    updateStats();
}

// Обновление статистики
function updateStats() {
    const workHistory = JSON.parse(localStorage.getItem('workHistory')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Фильтруем сеансы за сегодня
    const todaySessions = workHistory.filter(session => session.date === today);
    
    // Считаем общее время за сегодня
    const totalSecondsToday = todaySessions.reduce((total, session) => total + session.duration, 0);
    
    const hoursToday = Math.floor(totalSecondsToday / 3600);
    const minutesToday = Math.floor((totalSecondsToday % 3600) / 60);
    const secondsToday = totalSecondsToday % 60;
    
    todayTimeElement.textContent = 
        `${hoursToday.toString().padStart(2, '0')}:${minutesToday.toString().padStart(2, '0')}:${secondsToday.toString().padStart(2, '0')}`;
}

// Обновление почасовой ставки
function updateHourlyRate() {
    const hourlyRateInput = document.getElementById('hourlyRate');
    const rate = parseFloat(hourlyRateInput.value);
    
    if (!isNaN(rate) && rate >= 0) {
        localStorage.setItem('hourlyRate', rate.toString());
        alert('Почасовая ставка сохранена!');
        
        // Обновляем текущий заработок, если таймер работает
        if (isTimerRunning) {
            updateCurrentEarnings();
        }
    } else {
        alert('Пожалуйста, введите корректное значение для почасовой ставки.');
    }
}

// Загрузка истории работы
function loadWorkHistory() {
    // Эта функция будет расширена в следующем шаге
    updateStats();
}

// Показать определенную секцию
function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Показываем выбранную секцию
    document.getElementById(sectionId).classList.remove('hidden');
}

// Восстановление таймера при перезагрузке страницы
function restoreTimer() {
    const savedStartTime = localStorage.getItem('timerStartTime');
    if (savedStartTime) {
        startTime = new Date(savedStartTime);
        isTimerRunning = true;
        
        // Обновляем UI
        startButton.disabled = true;
        stopButton.disabled = false;
        
        // Запускаем интервал
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    restoreTimer();
    updateStats();
});
// Добавьте эти функции в app.js

// Показ истории работы
function showHistorySection() {
    const historySection = document.getElementById('historySection');
    if (!historySection) {
        // Создаем секцию истории, если её нет
        const mainContent = document.querySelector('.main-content');
        const historyHTML = `
            <section class="history-section" id="historySection">
                <h2>История работы</h2>
                <div class="history-filters">
                    <input type="date" id="startDate">
                    <span>по</span>
                    <input type="date" id="endDate">
                    <button onclick="filterHistory()">Фильтровать</button>
                    <button onclick="exportToPDF()">Экспорт в PDF</button>
                </div>
                <div class="history-list" id="historyList">
                    <!-- История будет загружена здесь -->
                </div>
                <div class="history-stats">
                    <h3>Статистика</h3>
                    <div id="historyStats">
                        <!-- Статистика будет загружена здесь -->
                    </div>
                </div>
            </section>
        `;
        mainContent.insertAdjacentHTML('beforeend', historyHTML);
    }
    
    // Загружаем историю
    loadHistory();
    
    // Показываем секцию
    showSection('historySection');
}

// Загрузка истории
function loadHistory() {
    const workHistory = JSON.parse(localStorage.getItem('workHistory')) || [];
    const historyList = document.getElementById('historyList');
    
    if (workHistory.length === 0) {
        historyList.innerHTML = '<p>История работы отсутствует.</p>';
        return;
    }
    
    // Сортируем историю по дате (новые first)
    workHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    let historyHTML = '';
    workHistory.forEach(session => {
        const date = new Date(session.startTime);
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        
        const hours = Math.floor(session.duration / 3600);
        const minutes = Math.floor((session.duration % 3600) / 60);
        
        historyHTML += `
            <div class="history-item">
                <div class="history-date">${date.toLocaleDateString()}</div>
                <div class="history-time">${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}</div>
                <div class="history-duration">${hours}ч ${minutes}м</div>
                <div class="history-earnings">${session.earnings.toFixed(2)} ₽</div>
            </div>
        `;
    });
    
    historyList.innerHTML = historyHTML;
    
    // Обновляем статистику
    updateHistoryStats(workHistory);
}

// Обновление статистики истории
function updateHistoryStats(workHistory) {
    const historyStats = document.getElementById('historyStats');
    
    if (workHistory.length === 0) {
        historyStats.innerHTML = '<p>Нет данных для отображения статистики.</p>';
        return;
    }
    
    // Вычисляем общую статистику
    const totalHours = workHistory.reduce((total, session) => total + (session.duration / 3600), 0);
    const totalEarnings = workHistory.reduce((total, session) => total + session.earnings, 0);
    const averageEarnings = totalEarnings / workHistory.length;
    
    // Находим самый длинный рабочий день
    const longestSession = workHistory.reduce((longest, session) => {
        return session.duration > longest.duration ? session : longest;
    }, workHistory[0]);
    
    historyStats.innerHTML = `
        <div class="stat-item">
            <span>Общее время:</span>
            <span>${totalHours.toFixed(2)} часов</span>
        </div>
        <div class="stat-item">
            <span>Общий заработок:</span>
            <span>${totalEarnings.toFixed(2)} ₽</span>
        </div>
        <div class="stat-item">
            <span>Средний заработок:</span>
            <span>${averageEarnings.toFixed(2)} ₽ за сеанс</span>
        </div>
        <div class="stat-item">
            <span>Самый длинный сеанс:</span>
            <span>${Math.floor(longestSession.duration / 3600)}ч ${Math.floor((longestSession.duration % 3600) / 60)}м</span>
        </div>
    `;
}

// Добавьте эти стили в styles.css для истории
.history-item {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr 1fr;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.history-filters {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.history-filters input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

@media (max-width: 768px) {
    .history-item {
        grid-template-columns: 1fr 1fr;
    }
    
    .history-filters {
        flex-direction: column;
        align-items: stretch;
    }
}
// Добавьте эти функции в app.js

// Показ командной секции
function showTeamSection() {
    const teamSection = document.getElementById('teamSection');
    if (!teamSection) {
        // Создаем секцию команды, если её нет
        const mainContent = document.querySelector('.main-content');
        const teamHTML = `
            <section class="team-section" id="teamSection">
                <h2>Командная работа</h2>
                <div class="team-members">
                    <h3>Участники команды</h3>
                    <div id="teamMembersList">
                        <!-- Список участников будет загружен здесь -->
                    </div>
                    <button onclick="addTeamMember()">Добавить участника</button>
                </div>
                <div class="team-stats">
                    <h3>Командная статистика</h3>
                    <div id="teamStats">
                        <!-- Командная статистика будет загружена здесь -->
                    </div>
                </div>
            </section>
        `;
        mainContent.insertAdjacentHTML('beforeend', teamHTML);
    }
    
    // Загружаем данные команды
    loadTeamData();
    
    // Показываем секцию
    showSection('teamSection');
}

// Загрузка данных команды
function loadTeamData() {
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
    const teamMembersList = document.getElementById('teamMembersList');
    
    if (teamMembers.length === 0) {
        teamMembersList.innerHTML = '<p>Участники команды не добавлены.</p>';
        return;
    }
    
    let membersHTML = '';
    teamMembers.forEach(member => {
        membersHTML += `
            <div class="team-member">
                <div class="member-name">${member.name}</div>
                <div class="member-email">${member.email}</div>
                <div class="member-role">${member.role}</div>
                <button onclick="removeTeamMember('${member.email}')">Удалить</button>
            </div>
        `;
    });
    
    teamMembersList.innerHTML = membersHTML;
    
    // Обновляем командную статистику
    updateTeamStats();
}

// Добавление участника команды
function addTeamMember() {
    const name = prompt('Введите имя участника:');
    if (!name) return;
    
    const email = prompt('Введите email участника:');
    if (!email) return;
    
    const role = prompt('Введите роль участника:');
    
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
    
    // Проверяем, не добавлен ли уже участник
    if (teamMembers.some(member => member.email === email)) {
        alert('Участник с таким email уже добавлен.');
        return;
    }
    
    // Добавляем нового участника
    teamMembers.push({
        name: name,
        email: email,
        role: role || 'Участник'
    });
    
    // Сохраняем обновленный список
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Обновляем список
    loadTeamData();
}

// Удаление участника команды
function removeTeamMember(email) {
    let teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
    teamMembers = teamMembers.filter(member => member.email !== email);
    
    // Сохраняем обновленный список
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Обновляем список
    loadTeamData();
}

// Обновление командной статистики
function updateTeamStats() {
    const teamStats = document.getElementById('teamStats');
    const workHistory = JSON.parse(localStorage.getItem('workHistory')) || [];
    
    // В реальном приложении здесь бы загружались данные всех участников команды
    const totalHours = workHistory.reduce((total, session) => total + (session.duration / 3600), 0);
    const totalEarnings = workHistory.reduce((total, session) => total + session.earnings, 0);
    
    teamStats.innerHTML = `
        <div class="stat-item">
            <span>Общее время команды:</span>
            <span>${totalHours.toFixed(2)} часов</span>
        </div>
        <div class="stat-item">
            <span>Общий заработок команды:</span>
            <span>${totalEarnings.toFixed(2)} ₽</span>
        </div>
    `;
}

// Добавьте эти стили в styles.css для команды
.team-member {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr auto;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
}

@media (max-width: 768px) {
    .team-member {
        grid-template-columns: 1fr;
    }
}