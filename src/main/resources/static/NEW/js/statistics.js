// Инициализация страницы статистики
window.initStatistics = async function() {
    console.log('Инициализация страницы статистики...');
    try {
        await loadStatistics();
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
};

// Функция обновления статистики
window.refreshStatistics = async function() {
    console.log('Обновление статистики...');
    try {
        await loadStatistics();
        showNotification('Статистика обновлена', 'success');
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
        showNotification('Ошибка обновления статистики', 'error');
    }
};

// Загрузка статистических данных
async function loadStatistics() {
    console.log('Загрузка статистических данных...');
    
    try {
        // Загружаем данные о тикетах
        console.log('Загружаем тикеты...');
        const ticketsResponse = await fetch('/requests');
        console.log('Ответ от /requests:', ticketsResponse.status, ticketsResponse.statusText);
        
        if (!ticketsResponse.ok) {
            console.error('Ошибка загрузки тикетов:', ticketsResponse.status, ticketsResponse.statusText);
            throw new Error('Ошибка загрузки тикетов');
        }
        
        const tickets = await ticketsResponse.json();
        console.log('Тикеты загружены:', tickets);
        console.log('Количество тикетов:', tickets.length);
        
        if (tickets.length > 0) {
            console.log('Пример тикета:', tickets[0]);
            console.log('Статусы тикетов:', tickets.map(t => t.status));
            console.log('Приоритеты тикетов:', tickets.map(t => t.priority));
        }

        // Загружаем данные о пользователях
        console.log('Загружаем пользователей...');
        const usersResponse = await fetch('/users');
        console.log('Ответ от /users:', usersResponse.status, usersResponse.statusText);
        
        if (!usersResponse.ok) {
            console.error('Ошибка загрузки пользователей:', usersResponse.status, usersResponse.statusText);
            throw new Error('Ошибка загрузки пользователей');
        }
        
        const users = await usersResponse.json();
        console.log('Пользователи загружены:', users);
        console.log('Количество пользователей:', users.length);

        // Обновляем статистику
        updateStatistics(tickets, users);
    } catch (error) {
        console.error('Ошибка в loadStatistics:', error);
        throw error;
    }
}

// Обновление статистики на странице
function updateStatistics(tickets, users) {
    console.log('Обновление статистики на странице...');
    console.log('Тикеты для обработки:', tickets);
    console.log('Пользователи для обработки:', users);
    
    // Проверяем существование элементов
    const totalTicketsEl = document.getElementById('stats-total-tickets');
    const totalUsersEl = document.getElementById('stats-total-users');
    const openTicketsEl = document.getElementById('stats-open-tickets');
    const closedTicketsEl = document.getElementById('stats-closed-tickets');
    const lowPriorityEl = document.getElementById('stats-low-priority');
    const mediumPriorityEl = document.getElementById('stats-medium-priority');
    const highPriorityEl = document.getElementById('stats-high-priority');
    
    console.log('Элементы найдены:', {
        totalTicketsEl: !!totalTicketsEl,
        totalUsersEl: !!totalUsersEl,
        openTicketsEl: !!openTicketsEl,
        closedTicketsEl: !!closedTicketsEl,
        lowPriorityEl: !!lowPriorityEl,
        mediumPriorityEl: !!mediumPriorityEl,
        highPriorityEl: !!highPriorityEl
    });
    
    // Общие статистики
    if (totalTicketsEl) totalTicketsEl.textContent = tickets.length;
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    
    // Статистика по статусам
    const openTickets = tickets.filter(ticket => ticket.status === 'OPEN').length;
    const closedTickets = tickets.filter(ticket => ticket.status === 'CLOSED').length;
    
    console.log('Открытые тикеты:', openTickets);
    console.log('Закрытые тикеты:', closedTickets);
    console.log('Все статусы тикетов:', [...new Set(tickets.map(t => t.status))]);
    
    if (openTicketsEl) openTicketsEl.textContent = openTickets;
    if (closedTicketsEl) closedTicketsEl.textContent = closedTickets;
    
    // Статистика по приоритетам
    const lowPriority = tickets.filter(ticket => 
        ticket.priority && ticket.priority.toLowerCase() === 'low'
    ).length;
    const mediumPriority = tickets.filter(ticket => 
        ticket.priority && ticket.priority.toLowerCase() === 'medium'
    ).length;
    const highPriority = tickets.filter(ticket => 
        ticket.priority && ticket.priority.toLowerCase() === 'high'
    ).length;
    
    console.log('Приоритеты тикетов:', [...new Set(tickets.map(t => t.priority))]);
    console.log('Низкий приоритет:', lowPriority);
    console.log('Средний приоритет:', mediumPriority);
    console.log('Высокий приоритет:', highPriority);
    
    if (lowPriorityEl) lowPriorityEl.textContent = lowPriority;
    if (mediumPriorityEl) mediumPriorityEl.textContent = mediumPriority;
    if (highPriorityEl) highPriorityEl.textContent = highPriority;
    
    // Список пользователей с задачами
    updateUsersList(tickets, users);
}

// Обновление списка пользователей с информацией о задачах
function updateUsersList(tickets, users) {
    console.log('Обновление списка пользователей...');
    const usersContainer = document.getElementById('users-list');
    
    if (!usersContainer) {
        console.error('Контейнер users-list не найден!');
        return;
    }
    
    if (users.length === 0) {
        console.log('Нет пользователей для отображения');
        usersContainer.innerHTML = `
            <div class="user-item">
                <i class="fas fa-info-circle"></i>
                <span>Нет пользователей</span>
            </div>
        `;
        return;
    }
    
    console.log('Обрабатываем пользователей:', users.length);
    const usersHTML = users.map(user => {
        // Подсчитываем задачи пользователя
        const userTickets = tickets.filter(ticket => 
            ticket.createUser && ticket.createUser.email === user.email
        );
        
        const openTasks = userTickets.filter(ticket => ticket.status === 'OPEN').length;
        const closedTasks = userTickets.filter(ticket => ticket.status === 'CLOSED').length;
        const totalTasks = userTickets.length;
        
        console.log(`Пользователь ${user.email}: ${totalTasks} задач (${openTasks} открытых, ${closedTasks} закрытых)`);
        
        return `
            <div class="user-item">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-role">${user.role}</div>
                </div>
                <div class="user-stats">
                    <div class="stat-item">
                        <span class="stat-number">${totalTasks}</span>
                        <span class="stat-label">Всего</span>
                    </div>
                    <div class="stat-item open">
                        <span class="stat-number">${openTasks}</span>
                        <span class="stat-label">Открыто</span>
                    </div>
                    <div class="stat-item closed">
                        <span class="stat-number">${closedTasks}</span>
                        <span class="stat-label">Закрыто</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('HTML сгенерирован, обновляем контейнер');
    usersContainer.innerHTML = usersHTML;
} 