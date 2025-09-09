let allTickets = [];
let currentSort = { field: null, asc: true };
let currentFilters = { search: '', status: 'ALL', priority: 'ALL', date: 'ALL' };

export async function init() {
    await renderTicketsPage();
    // Обновляем статистику после полной загрузки страницы
    await updateTicketStats();
}

export async function renderTicketsPage() {
    const content = document.getElementById('app');
    content.innerHTML = `
        <div class="table-header">
            <h2><i class="fas fa-list"></i> Список тикетов</h2>
            <div class="table-actions">
                <div class="filter-group">
                    <label for="filter-status">Статус:</label>
                    <select id="filter-status" class="modern-filter">
                        <option value="ALL">Все статусы</option>
                        <option value="OPEN">Открытые</option>
                        <option value="CLOSED">Закрытые</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-priority">Приоритет:</label>
                    <select id="filter-priority" class="modern-filter">
                        <option value="ALL">Любой приоритет</option>
                        <option value="HIGH">Высокий</option>
                        <option value="MEDIUM">Средний</option>
                        <option value="LOW">Низкий</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-date">Дата:</label>
                    <select id="filter-date" class="modern-filter">
                        <option value="ALL">Все даты</option>
                        <option value="TODAY">Сегодня</option>
                        <option value="YESTERDAY">Вчера</option>
                        <option value="WEEK">За неделю</option>
                        <option value="MONTH">За месяц</option>
                    </select>
                </div>
                <button class="refresh-btn" id="refresh-tickets-btn">
                    <i class="fas fa-sync-alt"></i> Обновить
                </button>
            </div>
        </div>
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th class="request" data-sort="id"><i class="fas fa-hashtag"></i> ID <span class="sort-arrow" id="sort-id"></span></th>
                            <th class="date" data-sort="data"><i class="fas fa-calendar"></i> Дата <span class="sort-arrow" id="sort-data"></span></th>
                            <th class="time" data-sort="time"><i class="fas fa-clock"></i> Время <span class="sort-arrow" id="sort-time"></span></th>
                            <th class="tema" data-sort="tema"><i class="fas fa-tag"></i> Тема <span class="sort-arrow" id="sort-tema"></span></th>
                            <th class="priority" data-sort="priority"><i class="fas fa-exclamation-triangle"></i> Приоритет <span class="sort-arrow" id="sort-priority"></span></th>
                            <th class="from" data-sort="from"><i class="fas fa-user"></i> От <span class="sort-arrow" id="sort-from"></span></th>
                            <th class="status" data-sort="status"><i class="fas fa-info-circle"></i> Статус <span class="sort-arrow" id="sort-status"></span></th>
                            <th class="edit"><i class="fas fa-cogs"></i> Действие</th>
                        </tr>
                    </thead>
                    <tbody id="tickets-tbody"></tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('refresh-tickets-btn').onclick = loadTickets;
    document.getElementById('filter-status').onchange = (e) => {
        currentFilters.status = e.target.value;
        renderFilteredTickets();
    };
    document.getElementById('filter-priority').onchange = (e) => {
        currentFilters.priority = e.target.value;
        renderFilteredTickets();
    };
    document.getElementById('filter-date').onchange = (e) => {
        currentFilters.date = e.target.value;
        renderFilteredTickets();
    };
    // Сортировка по клику на th
    document.querySelectorAll('.modern-table th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
            const field = th.getAttribute('data-sort');
            if (currentSort.field === field) {
                currentSort.asc = !currentSort.asc;
            } else {
                currentSort.field = field;
                currentSort.asc = true;
            }
            renderFilteredTickets();
        };
    });
    // Навешиваем глобальный поиск
    const globalSearch = document.querySelector('input[name="title"]');
    if (globalSearch) {
        globalSearch.oninput = (e) => {
            currentFilters.search = e.target.value;
            renderFilteredTickets();
        };
    }
    await loadTickets();
}

async function loadTickets() {
    const tbody = document.getElementById('tickets-tbody');
    if (!tbody) {
        console.warn('Element tickets-tbody not found');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="8">Загрузка...</td></tr>';
    try {
        const response = await fetch('/requests');
        if (!response.ok) throw new Error('Ошибка загрузки тикетов');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        allTickets = data;
        renderFilteredTickets();
        await updateTicketStats();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red;">${e.message}</td></tr>`;
    }
}

function renderFilteredTickets() {
    const tbody = document.getElementById('tickets-tbody');
    let filtered = allTickets.filter(ticket => {
        // Поиск по теме, описанию, пользователю
        const search = currentFilters.search.trim().toLowerCase();
        let match = true;
        if (search) {
            match = (
                (ticket.tema && ticket.tema.toLowerCase().includes(search)) ||
                (ticket.description && ticket.description.toLowerCase().includes(search)) ||
                (ticket.createUser && ((ticket.createUser.firstName + ' ' + ticket.createUser.lastName).toLowerCase().includes(search)))
            );
        }
        if (currentFilters.status !== 'ALL' && String(ticket.status).toUpperCase() !== currentFilters.status) return false;
        if (currentFilters.priority !== 'ALL' && String(ticket.priority).toUpperCase() !== currentFilters.priority) return false;
        if (currentFilters.date !== 'ALL' && !isDateMatch(ticket.data)) return false;
        return match;
    });
    // Сортировка
    if (currentSort.field) {
        filtered.sort((a, b) => {
            let v1 = a[currentSort.field];
            let v2 = b[currentSort.field];
            if (currentSort.field === 'from') {
                v1 = a.createUser ? (a.createUser.firstName + ' ' + a.createUser.lastName) : '';
                v2 = b.createUser ? (b.createUser.firstName + ' ' + b.createUser.lastName) : '';
            }
            if (typeof v1 === 'string') v1 = v1.toLowerCase();
            if (typeof v2 === 'string') v2 = v2.toLowerCase();
            if (v1 < v2) return currentSort.asc ? -1 : 1;
            if (v1 > v2) return currentSort.asc ? 1 : -1;
            return 0;
        });
    }
    // Стилизация стрелок сортировки
    document.querySelectorAll('.sort-arrow').forEach(el => el.innerHTML = '');
    if (currentSort.field) {
        const arrow = document.getElementById('sort-' + currentSort.field);
        if (arrow) {
            arrow.innerHTML = currentSort.asc ? '<i class="fas fa-chevron-up" style="color:#3498db;font-size:0.9em;"></i>' : '<i class="fas fa-chevron-down" style="color:#3498db;font-size:0.9em;"></i>';
        }
    }
    tbody.innerHTML = '';
    filtered.forEach(ticket => {
        tbody.appendChild(createTicketRow(ticket));
    });
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#aaa;">Нет заявок</td></tr>';
    }
}

// Функция для обновления статистики тикетов
export async function updateTicketStats() {
    // Проверяем, существуют ли элементы статистики
    const totalTicketsElement = document.getElementById('total-tickets');
    const openTicketsElement = document.getElementById('open-tickets');
    
    if (!totalTicketsElement && !openTicketsElement) {
        console.warn('Statistics elements not found');
        return;
    }
    
    try {
        // Получаем все тикеты
        const allTicketsResponse = await fetch('/requests');
        if (!allTicketsResponse.ok) throw new Error('Ошибка загрузки всех тикетов');
        const allTickets = await allTicketsResponse.json();
        
        // Получаем открытые тикеты
        const openTicketsResponse = await fetch('/getRequestsOpen');
        if (!openTicketsResponse.ok) throw new Error('Ошибка загрузки открытых тикетов');
        const openTickets = await openTicketsResponse.json();
        
        // Обновляем DOM-элементы
        if (totalTicketsElement) {
            totalTicketsElement.textContent = Array.isArray(allTickets) ? allTickets.length : 0;
        }
        
        if (openTicketsElement) {
            openTicketsElement.textContent = Array.isArray(openTickets) ? openTickets.length : 0;
        }
    } catch (e) {
        console.error('Ошибка обновления статистики тикетов:', e);
        // В случае ошибки устанавливаем 0
        if (totalTicketsElement) {
            totalTicketsElement.textContent = '0';
        }
        
        if (openTicketsElement) {
            openTicketsElement.textContent = '0';
        }
    }
}

function createTicketRow(ticket) {
    const tr = document.createElement('tr');
    let actions = '';
    if (ticket.status === 'OPEN') {
        actions = `
            <button class="action-btn edit" title="Редактировать" onclick="window.location.href='/#request-id${ticket.id}'"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" title="Закрыть" onclick="showCloseModal(${ticket.id})"><i class="fas fa-times"></i></button>
        `;
    } else {
        actions = `
            <button class="action-btn edit" title="Редактировать" onclick="window.location.href='/#request-id${ticket.id}'"><i class="fas fa-edit"></i></button>
            <button class="action-btn restore" title="Восстановить" onclick="showReopenModal(${ticket.id})"><i class="fas fa-undo"></i></button>
        `;
    }
    
    tr.innerHTML = `
        <td class="request">#${ticket.id}</td>
        <td class="date">${formatDate(ticket.data)}</td>
        <td class="time">${formatTime(ticket.time)}</td>
        <td class="tema">${ticket.tema}</td>
        <td class="priority"><span class="priority-badge ${getPriorityClass(ticket.priority)}">${ticket.priority}</span></td>
        <td class="from">${ticket.createUser ? ticket.createUser.firstName + ' ' + ticket.createUser.lastName : '—'}</td>
        <td class="status"><span class="status-badge ${getStatusClass(ticket.status)}">${ticket.status}</span></td>
        <td class="edit">
            <div class="action-buttons">
                ${actions}
            </div>
        </td>
    `;
    return tr;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        // Проверяем, если дата уже в формате DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                // Преобразуем DD.MM.YYYY в YYYY-MM-DD для JavaScript Date
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const date = new Date(isoDate);
                return date.toLocaleDateString('ru-RU');
            }
        }
        // Если это другой формат, пробуем стандартный парсинг
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU');
    } catch (e) {
        // Если не удалось распарсить, возвращаем как есть
        return dateStr;
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '—';
    return timeStr;
}

function isDateMatch(dateStr) {
    if (!dateStr || currentFilters.date === 'ALL') return true;
    
    try {
        let ticketDate;
        
        // Проверяем, если дата в формате DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                ticketDate = new Date(isoDate);
            }
        } else {
            ticketDate = new Date(dateStr);
        }
        
        if (isNaN(ticketDate.getTime())) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        ticketDate.setHours(0, 0, 0, 0);
        
        switch (currentFilters.date) {
            case 'TODAY':
                return ticketDate.getTime() === today.getTime();
            case 'YESTERDAY':
                return ticketDate.getTime() === yesterday.getTime();
            case 'WEEK':
                return ticketDate >= weekAgo && ticketDate <= today;
            case 'MONTH':
                return ticketDate >= monthAgo && ticketDate <= today;
            default:
                return true;
        }
    } catch (e) {
        console.error('Ошибка при проверке даты:', e);
        return false;
    }
}

function getPriorityClass(priority) {
    const classes = {
        'HIGH': 'priority-high',
        'MEDIUM': 'priority-medium',
        'LOW': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
}

function getStatusClass(status) {
    const classes = {
        'OPEN': 'status-open',
        'CLOSED': 'status-closed'
    };
    return classes[status] || 'status-open';
}

// Модалка закрытия тикета
window.showCloseModal = function(id) {
    document.getElementById('close-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'close-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.3)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div style="background: #fff; border-radius: 12px; padding: 32px 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); min-width: 320px; max-width: 90vw; text-align: center;">
            <h3 style="margin-bottom: 18px; color: #e74c3c;"><i class='fas fa-times-circle'></i> Подтвердите закрытие</h3>
            <p style="margin-bottom: 24px; color: #333;">Вы действительно хотите закрыть заявку <b>#${id}</b>?</p>
            <div style="display: flex; gap: 18px; justify-content: center;">
                <button id="close-confirm" style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Да, Закрыть</button>
                <button id="close-cancel" style="background: #f3f3f3; color: #333; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Нет</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-cancel').onclick = () => modal.remove();
    document.getElementById('close-confirm').onclick = () => {
        modal.remove();
        closeRequest(id);
    };
}

// AJAX-запрос на закрытие заявки
async function closeRequest(requestId) {
    try {
        const csrf = await getCsrfToken();
        const response = await fetch('/requestClose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrf.headerName]: csrf.token
            },
            body: JSON.stringify(requestId),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка при закрытии заявки');
        const data = await response.json();
        showNotification(data.message || 'Заявка закрыта!', 'success');
        
        // Проверяем, на какой странице мы находимся, и обновляем соответствующую таблицу
        const closedTicketsTbody = document.getElementById('closed-tickets-tbody');
        const ticketsTbody = document.getElementById('tickets-tbody');
        
        if (closedTicketsTbody) {
            // Мы на странице закрытых заявок
            await loadClosedTickets();
        } else if (ticketsTbody) {
            // Мы на странице всех заявок
            await loadTickets();
        }
        
        // Обновляем статистику, если элементы существуют
        const totalTicketsElement = document.getElementById('total-tickets');
        const openTicketsElement = document.getElementById('open-tickets');
        if (totalTicketsElement || openTicketsElement) {
            await updateTicketStats();
        }
    } catch (error) {
        showNotification(error.message || 'Ошибка при закрытии', 'error');
    }
}

export function renderCreateTicketPage() {
    const content = document.getElementById('app');
    content.innerHTML = `
        <div class="form-container">
            <div class="form">
                <h2><i class="fas fa-plus-circle"></i> Создание заявки</h2>
                <form id="create-request-form">
                    <div class="input-group">
                        <div class="input-item">
                            <label for="tema">Тема:</label>
                            <input type="text" id="tema" name="tema" required>
                        </div>
                        <div class="input-item">
                            <label for="priority">Приоритет:</label>
                            <select id="priority" name="priority" required>
                                <option value="">Выберите приоритет</option>
                                <option value="HIGH">Высокий</option>
                                <option value="MEDIUM">Средний</option>
                                <option value="LOW">Низкий</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <div class="input-item">
                            <label for="description">Описание:</label>
                            <textarea id="description" name="description" rows="4" required></textarea>
                        </div>
                    </div>
                    <div class="input-group">
                        <div class="input-item">
                            <label for="userId">Назначить пользователю:</label>
                            <select id="userId" name="userId" required>
                                <option value="">Выберите пользователя</option>
                            </select>
                        </div>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="submit-btn">
                            <i class="fas fa-plus"></i> Создать заявку
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    loadUsersForSelect();
    bindCreateRequestForm();
}

function loadUsersForSelect() {
    const select = document.getElementById('userId');
    select.innerHTML = '<option value="" disabled selected>Загрузка пользователей...</option>';
    
    fetch('/getDTOUser')
        .then(response => response.json())
        .then(users => {
            select.innerHTML = '<option value="">Выберите пользователя</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
                select.appendChild(option);
            });
        })
        .catch(() => {
            select.innerHTML = '<option value="" disabled selected>Ошибка загрузки пользователей</option>';
        });
}

function bindCreateRequestForm() {
    const form = document.getElementById('create-request-form');
    form.onsubmit = async function(event) {
        event.preventDefault();
        const tema = form.tema.value.trim();
        const priority = form.priority.value;
        const description = form.description.value.trim();
        const userId = form['userId'].value;
        if (!tema || !priority || !description || !userId) return;
        try {
            const csrf = await getCsrfToken();
            
            // Получаем текущую дату и время
            const currentDate = new Date();
            const date = currentDate.toLocaleDateString();
            const time = currentDate.toLocaleTimeString();
            
            const requestData = {
                data: date,
                time: time,
                tema,
                priority,
                description,
                user: userId
            };
            const response = await fetch('/RequestCreate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [csrf.headerName]: csrf.token
                },
                body: JSON.stringify(requestData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Ошибка создания тикета');
            const data = await response.json();
            showNotification(data.message || 'Тикет создан!', 'success');
            setTimeout(() => {
                window.location.hash = '#request-id' + data.id;
            }, 1200);
        } catch (e) {
            showNotification(e.message || 'Ошибка', 'error');
        }
    };
}

async function getCsrfToken() {
    const r = await fetch('/csrf-token', { credentials: 'include' });
    if (!r.ok) throw new Error('CSRF error');
    return await r.json();
}

// SPA: обработка кнопки 'Закрытые заявки'
document.addEventListener('DOMContentLoaded', () => {
    const closedBtn = document.getElementById('show-closed-tickets-btn');
    if (closedBtn) {
        closedBtn.onclick = () => {
            window.location.hash = '#closed';
        };
    }
});

export async function renderClosedTicketsPage() {
    const content = document.getElementById('app');
    content.innerHTML = `
        <div class="table-header">
            <h2><i class="fas fa-archive"></i> Закрытые заявки</h2>
            <div class="table-actions">
                <button class="refresh-btn" id="refresh-closed-tickets-btn">
                    <i class="fas fa-sync-alt"></i> Обновить
                </button>
                <button class="refresh-btn" id="show-open-tickets-btn">
                    <i class="fas fa-list"></i> Открытые заявки
                </button>
            </div>
        </div>
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th class="request"><i class="fas fa-hashtag"></i> ID</th>
                            <th class="date"><i class="fas fa-calendar"></i> Дата</th>
                            <th class="time"><i class="fas fa-clock"></i> Время</th>
                            <th class="tema"><i class="fas fa-tag"></i> Тема</th>
                            <th class="priority"><i class="fas fa-exclamation-triangle"></i> Приоритет</th>
                            <th class="from"><i class="fas fa-user"></i> От</th>
                            <th class="status"><i class="fas fa-info-circle"></i> Статус</th>
                            <th class="edit"><i class="fas fa-cogs"></i> Действие</th>
                        </tr>
                    </thead>
                    <tbody id="closed-tickets-tbody"></tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('refresh-closed-tickets-btn').onclick = loadClosedTickets;
    document.getElementById('show-open-tickets-btn').onclick = () => {
        window.location.hash = '#';
    };
    await loadClosedTickets();
}

async function loadClosedTickets() {
    const tbody = document.getElementById('closed-tickets-tbody');
    if (!tbody) {
        console.warn('Element closed-tickets-tbody not found');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="8">Загрузка...</td></tr>';
    try {
        const response = await fetch('/getRequestsClose');
        if (!response.ok) throw new Error('Ошибка загрузки закрытых тикетов');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        tbody.innerHTML = '';
        data.forEach(ticket => {
            tbody.appendChild(createClosedTicketRow(ticket));
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red;">${e.message}</td></tr>`;
    }
}

function createClosedTicketRow(ticket) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="request">#${ticket.id}</td>
        <td class="date">${formatDate(ticket.data)}</td>
        <td class="time">${formatTime(ticket.time)}</td>
        <td class="tema">${ticket.tema}</td>
        <td class="priority"><span class="priority-badge ${getPriorityClass(ticket.priority)}">${ticket.priority}</span></td>
        <td class="from">${ticket.createUser ? ticket.createUser.firstName + ' ' + ticket.createUser.lastName : '—'}</td>
        <td class="status"><span class="status-badge ${getStatusClass(ticket.status)}">${ticket.status}</span></td>
        <td class="edit">
            <div class="action-buttons">
                <button class="action-btn edit" title="Редактировать" onclick="window.location.href='/#request-id${ticket.id}'"><i class="fas fa-edit"></i></button>
                <button class="action-btn restore" title="Восстановить" onclick="showReopenModal(${ticket.id})"><i class="fas fa-undo"></i></button>
            </div>
        </td>
    `;
    return tr;
}

// Модалка восстановления тикета
window.showReopenModal = function(id) {
    document.getElementById('reopen-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'reopen-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.3)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div style="background: #fff; border-radius: 12px; padding: 32px 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); min-width: 320px; max-width: 90vw; text-align: center;">
            <h3 style="margin-bottom: 18px; color: #27ae60;"><i class='fas fa-undo'></i> Подтвердите восстановление</h3>
            <p style="margin-bottom: 24px; color: #333;">Вы действительно хотите восстановить заявку <b>#${id}</b>?</p>
            <div style="display: flex; gap: 18px; justify-content: center;">
                <button id="reopen-confirm" style="background: linear-gradient(135deg, #27ae60, #16a085); color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Да, Восстановить</button>
                <button id="reopen-cancel" style="background: #f3f3f3; color: #333; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Нет</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('reopen-cancel').onclick = () => modal.remove();
    document.getElementById('reopen-confirm').onclick = () => {
        modal.remove();
        reopenRequest(id);
    };
}

// AJAX-запрос на восстановление заявки
async function reopenRequest(requestId) {
    try {
        const csrf = await getCsrfToken();
        const response = await fetch('/reopenRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrf.headerName]: csrf.token
            },
            body: JSON.stringify(requestId),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка при восстановлении заявки');
        const data = await response.json();
        showNotification(data.message || 'Заявка восстановлена!', 'success');
        
        // Проверяем, на какой странице мы находимся, и обновляем соответствующую таблицу
        const closedTicketsTbody = document.getElementById('closed-tickets-tbody');
        const ticketsTbody = document.getElementById('tickets-tbody');
        
        if (closedTicketsTbody) {
            // Мы на странице закрытых заявок
            await loadClosedTickets();
        } else if (ticketsTbody) {
            // Мы на странице всех заявок
            await loadTickets();
        }
        
        // Обновляем статистику, если элементы существуют
        const totalTicketsElement = document.getElementById('total-tickets');
        const openTicketsElement = document.getElementById('open-tickets');
        if (totalTicketsElement || openTicketsElement) {
            await updateTicketStats();
        }
    } catch (error) {
        showNotification(error.message || 'Ошибка при восстановлении', 'error');
    }
} 