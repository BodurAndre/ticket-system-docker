// loadAllTickets.js — точка входа для главной страницы тикетов

let allTickets = [];
let allCompanies = [];
let allUsers = [];
let ticketSort = { field: 'id', asc: false }; // По умолчанию сортируем по ID в убывающем порядке
let ticketFilters = { search: '', status: 'ALL', priority: 'ALL', date: 'TODAY', company: 'ALL', creator: 'ALL', assignee: 'ALL' };

// Функции для работы с localStorage
function saveFilters() {
    localStorage.setItem('ticketFilters', JSON.stringify(ticketFilters));
    localStorage.setItem('ticketSort', JSON.stringify(ticketSort));
}

function loadFilters() {
    const savedFilters = localStorage.getItem('ticketFilters');
    const savedSort = localStorage.getItem('ticketSort');
    
    if (savedFilters) {
        ticketFilters = JSON.parse(savedFilters);
    }
    
    if (savedSort) {
        ticketSort = JSON.parse(savedSort);
    } else {
        // Если нет сохраненной сортировки, устанавливаем по умолчанию
        ticketSort = { field: 'id', asc: false };
    }
}

function applySavedFilters() {
    // Применяем сохраненные значения к элементам формы
    const globalSearch = document.getElementById('search-input');
    if (globalSearch && ticketFilters.search) {
        globalSearch.value = ticketFilters.search;
    }
    
    const status = document.getElementById('filter-status');
    if (status && ticketFilters.status) {
        status.value = ticketFilters.status;
    }
    
    const priority = document.getElementById('filter-priority');
    if (priority && ticketFilters.priority) {
        priority.value = ticketFilters.priority;
    }
    
    const date = document.getElementById('filter-date');
    if (date && ticketFilters.date) {
        date.value = ticketFilters.date;
    }

    const company = document.getElementById('filter-company');
    if (company && ticketFilters.company) company.value = ticketFilters.company;
    const creator = document.getElementById('filter-creator');
    if (creator && ticketFilters.creator) creator.value = ticketFilters.creator;
    const assignee = document.getElementById('filter-assignee');
    if (assignee && ticketFilters.assignee) assignee.value = ticketFilters.assignee;
}

function resetFilters() {
    ticketFilters = { search: '', status: 'ALL', priority: 'ALL', date: 'ALL', company: 'ALL', creator: 'ALL', assignee: 'ALL' };
    ticketSort = { field: 'id', asc: false }; // Сбрасываем к сортировке по ID в убывающем порядке
    
    // Очищаем поля формы
    const globalSearch = document.getElementById('search-input');
    if (globalSearch) {
        globalSearch.value = '';
    }
    
    const status = document.getElementById('filter-status');
    if (status) {
        status.value = 'ALL';
    }
    
    const priority = document.getElementById('filter-priority');
    if (priority) {
        priority.value = 'ALL';
    }
    
    const date = document.getElementById('filter-date');
    if (date) {
        date.value = 'ALL';
    }

    const company = document.getElementById('filter-company');
    if (company) company.value = 'ALL';
    const creator = document.getElementById('filter-creator');
    if (creator) creator.value = 'ALL';
    const assignee = document.getElementById('filter-assignee');
    if (assignee) assignee.value = 'ALL';
    
    // Очищаем стрелки сортировки
    document.querySelectorAll('.sort-arrow').forEach(el => el.innerHTML = '');
    
    // Устанавливаем стрелку для сортировки по ID
    const arrow = document.getElementById('sort-id');
    if (arrow) {
        arrow.innerHTML = '<i class="fas fa-chevron-down" style="color:#3498db;font-size:0.9em;"></i>';
    }
    
    // Сохраняем сброшенные фильтры
    saveFilters();
    
    // Обновляем таблицу с сброшенными фильтрами
    refreshTable();
}

export function init() {
    // Загружаем сохраненные фильтры
    loadFilters();
    
    // Загружаем все компании и пользователи
    loadAllCompanies();
    loadAllUsers();
    
    refreshTable();
    
    // Навешиваем обработчики после загрузки таблицы
    setTimeout(() => {
        // Применяем сохраненные фильтры к элементам формы
        applySavedFilters();
        
        // Устанавливаем стрелку сортировки
        document.querySelectorAll('.sort-arrow').forEach(el => el.innerHTML = '');
        if (ticketSort.field) {
            const arrow = document.getElementById('sort-' + ticketSort.field);
            if (arrow) {
                arrow.innerHTML = ticketSort.asc ? 
                    '<i class="fas fa-chevron-up" style="color:#3498db;font-size:0.9em;"></i>' : 
                    '<i class="fas fa-chevron-down" style="color:#3498db;font-size:0.9em;"></i>';
            }
        }
        
        // Используем глобальный поиск
        const globalSearch = document.getElementById('search-input');
        if (globalSearch) {
            globalSearch.oninput = (e) => { 
                ticketFilters.search = e.target.value; 
                saveFilters();
                refreshTable(); 
            };
        }
        
        const status = document.getElementById('filter-status');
        if (status) {
            status.onchange = (e) => { 
                ticketFilters.status = e.target.value; 
                saveFilters();
                refreshTable(); 
            };
        }
        
        const priority = document.getElementById('filter-priority');
        if (priority) {
            priority.onchange = (e) => { 
                ticketFilters.priority = e.target.value; 
                saveFilters();
                refreshTable(); 
            };
        }
        
        const date = document.getElementById('filter-date');
        if (date) {
            date.onchange = (e) => { 
                ticketFilters.date = e.target.value; 
                saveFilters();
                refreshTable(); 
            };
        }

        const company = document.getElementById('filter-company');
        if (company) company.onchange = (e) => { ticketFilters.company = e.target.value; saveFilters(); refreshTable(); };
        const creator = document.getElementById('filter-creator');
        if (creator) creator.onchange = (e) => { ticketFilters.creator = e.target.value; saveFilters(); refreshTable(); };
        const assignee = document.getElementById('filter-assignee');
        if (assignee) assignee.onchange = (e) => { ticketFilters.assignee = e.target.value; saveFilters(); refreshTable(); };
        
        // Добавляем обработчик для кнопки сброса фильтров
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.onclick = resetFilters;
        }
        
        document.querySelectorAll('.modern-table th[data-sort]').forEach(th => {
            th.style.cursor = 'pointer';
            th.onclick = () => {
                const field = th.getAttribute('data-sort');
                if (ticketSort.field === field) {
                    ticketSort.asc = !ticketSort.asc;
                } else {
                    ticketSort.field = field;
                    ticketSort.asc = true;
                }
                saveFilters();
                renderFilteredTickets();
            };
        });
    }, 100);
}

export async function refreshTable() {
    const csrf = await getCsrfToken();
    const filter = {
        status: ticketFilters.status !== 'ALL' ? ticketFilters.status : null,
        priority: ticketFilters.priority !== 'ALL' ? ticketFilters.priority : null,
        date: ticketFilters.date !== 'ALL' ? ticketFilters.date : null,
        companyId: getCompanyIdByName(ticketFilters.company),
        assigneeId: getUserIdByName(ticketFilters.assignee),
        creatorId: getUserIdByName(ticketFilters.creator)
    };
    $.ajax({
        url: '/requests/filter',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(filter),
        headers: { [csrf.headerName]: csrf.token },
        success: function(data) {
            allTickets = data;
            fillFilterOptions();
            renderFilteredTickets();
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при загрузке данных: ", error);
        }
    });
}

window.refreshTable = refreshTable;

function fillFilterOptions() {
    // Компании - используем все загруженные компании
    const companySelect = document.getElementById('filter-company');
    if (companySelect) {
        companySelect.innerHTML = '<option value="ALL">Все компании</option>' + 
            allCompanies.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        companySelect.value = ticketFilters.company;
    }
    
    // Создатели - используем всех загруженных пользователей
    const creatorSelect = document.getElementById('filter-creator');
    if (creatorSelect) {
        creatorSelect.innerHTML = '<option value="ALL">Все</option>' + 
            allUsers.map(u => `<option value="${u.firstName} ${u.lastName}">${u.firstName} ${u.lastName}</option>`).join('');
        creatorSelect.value = ticketFilters.creator;
    }
    
    // Исполнители - используем всех загруженных пользователей
    const assigneeSelect = document.getElementById('filter-assignee');
    if (assigneeSelect) {
        assigneeSelect.innerHTML = '<option value="ALL">Все</option>' + 
            allUsers.map(u => `<option value="${u.firstName} ${u.lastName}">${u.firstName} ${u.lastName}</option>`).join('');
        assigneeSelect.value = ticketFilters.assignee;
    }
}

function renderFilteredTickets() {
    let filtered = allTickets.filter(ticket => {
        const search = ticketFilters.search.trim().toLowerCase();
        let match = true;
        if (search) {
            match = (
                (ticket.tema && ticket.tema.toLowerCase().includes(search)) ||
                (ticket.description && ticket.description.toLowerCase().includes(search)) ||
                (ticket.createUser && ((ticket.createUser.firstName + ' ' + ticket.createUser.lastName).toLowerCase().includes(search))) ||
                (ticket.company && ticket.company.name && ticket.company.name.toLowerCase().includes(search)) ||
                (ticket.assigneeUser && ((ticket.assigneeUser.firstName + ' ' + ticket.assigneeUser.lastName).toLowerCase().includes(search)))
            );
        }
        if (ticketFilters.status !== 'ALL' && String(ticket.status).toUpperCase() !== ticketFilters.status) return false;
        if (ticketFilters.priority !== 'ALL' && String(ticket.priority).toUpperCase() !== ticketFilters.priority) return false;
        if (ticketFilters.date !== 'ALL' && !isDateMatch(ticket.data)) return false;
        if (ticketFilters.company !== 'ALL' && (!ticket.company || ticket.company.name !== ticketFilters.company)) return false;
        if (ticketFilters.creator !== 'ALL' && (!ticket.createUser || (ticket.createUser.firstName + ' ' + ticket.createUser.lastName) !== ticketFilters.creator)) return false;
        if (ticketFilters.assignee !== 'ALL' && (!ticket.assigneeUser || (ticket.assigneeUser.firstName + ' ' + ticket.assigneeUser.lastName) !== ticketFilters.assignee)) return false;
        return match;
    });
    
    // Сортировка
    if (ticketSort.field) {
        filtered.sort((a, b) => {
            let v1 = a[ticketSort.field];
            let v2 = b[ticketSort.field];
            if (ticketSort.field === 'from') {
                v1 = a.createUser ? (a.createUser.firstName + ' ' + a.createUser.lastName) : '';
                v2 = b.createUser ? (b.createUser.firstName + ' ' + b.createUser.lastName) : '';
            } else if (ticketSort.field === 'assignee') {
                v1 = a.assigneeUser ? (a.assigneeUser.firstName + ' ' + a.assigneeUser.lastName) : '';
                v2 = b.assigneeUser ? (b.assigneeUser.firstName + ' ' + b.assigneeUser.lastName) : '';
            }
            if (typeof v1 === 'string') v1 = v1.toLowerCase();
            if (typeof v2 === 'string') v2 = v2.toLowerCase();
            if (v1 < v2) return ticketSort.asc ? -1 : 1;
            if (v1 > v2) return ticketSort.asc ? 1 : -1;
            return 0;
        });
    }
    
    // Стилизация стрелок сортировки
    document.querySelectorAll('.sort-arrow').forEach(el => el.innerHTML = '');
    if (ticketSort.field) {
        const arrow = document.getElementById('sort-' + ticketSort.field);
        if (arrow) {
            arrow.innerHTML = ticketSort.asc ? '<i class="fas fa-chevron-up" style="color:#3498db;font-size:0.9em;"></i>' : '<i class="fas fa-chevron-down" style="color:#3498db;font-size:0.9em;"></i>';
        }
    }
    
    let tableBody = document.querySelector("#ticketsTable tbody");
    tableBody.innerHTML = '';
    
    filtered.forEach(function(ticket) {
        let row = document.createElement('tr');
        
        let cellId = document.createElement('td');
        cellId.textContent = ticket.id;
        row.appendChild(cellId);
        
        let cellData = document.createElement('td');
        cellData.textContent = formatDate(ticket.data);
        row.appendChild(cellData);
        
        let cellTime = document.createElement('td');
        cellTime.textContent = formatTime(ticket.time);
        row.appendChild(cellTime);
        
        let cellTema = document.createElement('td');
        cellTema.textContent = ticket.tema;
        row.appendChild(cellTema);
        
        let cellCompany = document.createElement('td');
        if(ticket.company != null) {
            cellCompany.textContent = ticket.company.name;
        } else {
            cellCompany.textContent = "Не указана";
        }
        row.appendChild(cellCompany);
        
        let cellPriority = document.createElement('td');
        cellPriority.innerHTML = `<span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>`;
        row.appendChild(cellPriority);
        
        let cellUser = document.createElement('td');
        if(ticket.createUser != null) {
            const user = ticket.createUser;
            const userText = `${user.firstName} ${user.lastName}`;
            cellUser.textContent = userText;
        } else {
            cellUser.textContent = "Не указан";
        }
        row.appendChild(cellUser);
        
        let cellAssignee = document.createElement('td');
        if(ticket.assigneeUser != null) {
            const assignee = ticket.assigneeUser;
            const assigneeText = `${assignee.firstName} ${assignee.lastName}`;
            cellAssignee.textContent = assigneeText;
        } else {
            cellAssignee.textContent = "Не назначен";
        }
        row.appendChild(cellAssignee);
        
        let cellStatus = document.createElement('td');
        cellStatus.innerHTML = `<span class="status-badge status-${ticket.status.toLowerCase()}">${ticket.status}</span>`;
        row.appendChild(cellStatus);
        
        let cellAction = document.createElement('td');
        cellAction.className = 'edit';
        let actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';
        
        let editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit';
        editBtn.title = 'Редактировать';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = '#request-id' + ticket.id;
        });
        actionDiv.appendChild(editBtn);
        
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.title = 'Закрыть';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showDeleteModal(ticket.id);
        });
        actionDiv.appendChild(deleteBtn);
        
        cellAction.appendChild(actionDiv);
        row.appendChild(cellAction);
        
        tableBody.appendChild(row);
    });
    
    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#aaa;">Нет тикетов</td></tr>';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        // Проверяем, если дата уже в формате DD.MM.YYYY
        if (typeof dateStr === 'string' && dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            return dateStr; // Возвращаем как есть
        }
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr; // Возвращаем исходную строку если не удалось распарсить
        }
        
        // Форматируем в DD.MM.YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    } catch (e) {
        return dateStr;
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
}

function isDateMatch(dateStr) {
    if (!dateStr) return false;
    
    let ticketDate;
    try {
        // Проверяем, если дата в формате DD.MM.YYYY
        if (typeof dateStr === 'string' && dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            const parts = dateStr.split('.');
            ticketDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
            ticketDate = new Date(dateStr);
        }
        
        if (isNaN(ticketDate.getTime())) {
            return false;
        }
    } catch (e) {
        return false;
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    // Сбрасываем время для корректного сравнения дат
    const resetTime = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };
    
    const ticketDateOnly = resetTime(ticketDate);
    const todayOnly = resetTime(today);
    const yesterdayOnly = resetTime(yesterday);
    const weekAgoOnly = resetTime(weekAgo);
    const monthAgoOnly = resetTime(monthAgo);
    
    switch (ticketFilters.date) {
        case 'TODAY':
            return ticketDateOnly.getTime() === todayOnly.getTime();
        case 'YESTERDAY':
            return ticketDateOnly.getTime() === yesterdayOnly.getTime();
        case 'WEEK':
            return ticketDateOnly >= weekAgoOnly;
        case 'MONTH':
            return ticketDateOnly >= monthAgoOnly;
        default:
            return true;
    }
}

// Модальное окно подтверждения удаления
function showDeleteModal(requestId) {
    // Удаляем старое окно, если оно есть
    document.getElementById('delete-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'delete-modal';
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
            <h3 style="margin-bottom: 18px; color: #e74c3c;"><i class='fas fa-exclamation-triangle'></i> Подтвердите закрытие</h3>
            <p style="margin-bottom: 24px; color: #333;">Вы действительно хотите закрыть заявку <b>#${requestId}</b>?</p>
            <div style="display: flex; gap: 18px; justify-content: center;">
                <button id="delete-confirm" style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Да, Закрыть</button>
                <button id="delete-cancel" style="background: #f3f3f3; color: #333; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Нет</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('delete-cancel').onclick = () => modal.remove();
    document.getElementById('delete-confirm').onclick = () => {
        modal.remove();
        deleteRequest(requestId);
    };
}

// Функция удаления заявки (заглушка)
async function deleteRequest(requestId) {
    // Здесь должен быть AJAX-запрос на удаление заявки
    try {
        const csrf = await getCsrfToken();
        $.ajax({
            url: "/requestClose",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(requestId),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function (data) {
                console.log("Request close:", data);
                showNotification(data.message, 'success');
                setTimeout(() => refreshTable(), 500);
            },
            error: function (error) {
                showNotification(`Заявка #${requestId} не удалена`, 'error');
                throw new Error("Ошибка при закрытии заявки");
            }
        });
    } catch (error) {
        console.error("Error:", error);
        showNotification("Ошибка", 'error');
    }
}

async function getCsrfToken() {
    return $.ajax({
        url: "/csrf-token",
        method: "GET",
        dataType: "json",
        xhrFields: { withCredentials: true }
    }).then(data => ({ headerName: data.headerName, token: data.token }))
        .catch(() => {
            console.error("Error fetching CSRF token");
            throw new Error("CSRF token error");
        });
}

// Вспомогательные функции для поиска id по имени
function getCompanyIdByName(name) {
    if (!name || name === 'ALL') return null;
    const company = allCompanies.find(c => c.name === name);
    return company ? company.id : null;
}

function getUserIdByName(name) {
    if (!name || name === 'ALL') return null;
    const user = allUsers.find(u => (u.firstName + ' ' + u.lastName) === name);
    return user ? user.id : null;
}

// Функции для загрузки всех компаний и пользователей
async function loadAllCompanies() {
    const csrf = await getCsrfToken();
    $.ajax({
        url: '/api/companies',
        method: 'GET',
        headers: { [csrf.headerName]: csrf.token },
        success: function(data) {
            allCompanies = data;
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при загрузке компаний: ", error);
        }
    });
}

async function loadAllUsers() {
    const csrf = await getCsrfToken();
    $.ajax({
        url: '/api/users/all',
        method: 'GET',
        headers: { [csrf.headerName]: csrf.token },
        success: function(data) {
            allUsers = data;
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при загрузке пользователей: ", error);
        }
    });
}