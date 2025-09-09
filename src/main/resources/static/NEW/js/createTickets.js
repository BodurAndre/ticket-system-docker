// Инициализация страницы создания тикетов
export function init() {
    console.log('Инициализация страницы создания тикетов...');
    
    // Добавляем кнопку для инициализации данных (временно для тестирования)
    addInitDataButton();
    
    // Тестируем API
    testAPI();
    
    loadCompanies();
    loadUsers();
    setupFormHandlers();
    setupModalHandlers();
    console.log('Инициализация завершена');
}

// Добавление кнопки для инициализации данных
function addInitDataButton() {
    const form = document.querySelector('.form');
    if (form) {
        const initButton = document.createElement('button');
        initButton.type = 'button';
        initButton.textContent = 'Инициализировать данные';
        initButton.style.cssText = `
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            margin-bottom: 16px;
            cursor: pointer;
        `;
        initButton.onclick = initializeData;
        form.insertBefore(initButton, form.firstChild);
    }
}

// Получение CSRF токена
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

// Функция инициализации данных
async function initializeData() {
    try {
        console.log('Инициализируем данные...');
        const csrf = await getCsrfToken();
        
        $.ajax({
            url: "/api/init-data",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({}),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function(data) {
                console.log('Результат инициализации:', data);
                showNotification(data.message, 'success');
                
                // Перезагружаем компании после инициализации
                setTimeout(() => {
                    loadCompanies();
                }, 1000);
            },
            error: function(error) {
                console.error("Error:", error);
                showNotification("Code " + error.status + " : " + error.responseJSON?.error, 'error');
            }
        });
        
    } catch (error) {
        console.error('Ошибка инициализации данных:', error);
        showNotification('Ошибка инициализации данных: ' + error.message, 'error');
    }
}

// Загрузка списка компаний
async function loadCompanies() {
    try {
        console.log('Загружаем компании...');
        const response = await fetch('/api/companies');
        console.log('Ответ от сервера:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            throw new Error(`Ошибка загрузки компаний: ${response.status} ${response.statusText}`);
        }
        
        const companies = await response.json();
        console.log('Полученные компании:', companies);
        
        const companySelect = document.getElementById('select-company');
        if (!companySelect) {
            console.error('Элемент select-company не найден');
            return;
        }
        
        // Очищаем существующие опции
        companySelect.innerHTML = '<option value="" disabled selected>Выберите компанию</option>';
        
        // Добавляем компании
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            companySelect.appendChild(option);
        });
        
        console.log('Компании загружены успешно');
    } catch (error) {
        console.error('Ошибка загрузки компаний:', error);
        showNotification('Ошибка загрузки списка компаний: ' + error.message, 'error');
    }
}

// Загрузка серверов по выбранной компании
async function loadServersByCompany(companyId) {
    try {
        console.log('Загружаем серверы для компании:', companyId);
        const response = await fetch(`/api/servers/${companyId}`);
        console.log('Ответ от сервера:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            throw new Error(`Ошибка загрузки серверов: ${response.status} ${response.statusText}`);
        }
        
        const servers = await response.json();
        console.log('Полученные серверы:', servers);
        
        const serverSelect = document.getElementById('select-server');
        if (!serverSelect) {
            console.error('Элемент select-server не найден');
            return;
        }
        
        // Очищаем существующие опции
        serverSelect.innerHTML = '<option value="" disabled selected>Выберите сервер</option>';
        
        // Добавляем серверы
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });
        
        console.log('Серверы загружены успешно');
    } catch (error) {
        console.error('Ошибка загрузки серверов:', error);
        showNotification('Ошибка загрузки списка серверов: ' + error.message, 'error');
    }
}

// Загрузка номеров телефонов по выбранной компании
async function loadPhoneNumbersByCompany(companyId, selectedNumber = null) {
    try {
        console.log('Загружаем номера телефонов для компании:', companyId);
        const response = await fetch(`/api/phoneNumbers/${companyId}`);
        if (!response.ok) throw new Error('Ошибка загрузки номеров телефонов');
        const phoneNumbers = await response.json();
        const contactsSelect = document.getElementById('select-contacts');
        if (!contactsSelect) return;
        contactsSelect.innerHTML = '<option value="" disabled selected>Выберите номер телефона</option>';
        phoneNumbers.forEach(phone => {
            const option = document.createElement('option');
            option.value = phone.number;
            option.textContent = phone.number;
            if (selectedNumber && phone.number === selectedNumber) option.selected = true;
            contactsSelect.appendChild(option);
        });
    } catch (error) {
        showNotification('Ошибка загрузки списка номеров телефонов: ' + error.message, 'error');
    }
}

// Загрузка списка пользователей
async function loadUsers() {
    try {
        console.log('Загружаем пользователей...');
        const response = await fetch('/getUsers');
        console.log('Ответ от сервера:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            throw new Error(`Ошибка загрузки пользователей: ${response.status} ${response.statusText}`);
        }
        
        const users = await response.json();
        console.log('Полученные пользователи:', users);
        
        // Отладочная информация для первого пользователя
        if (users.length > 0) {
            console.log('Структура первого пользователя:', users[0]);
            console.log('user.ID:', users[0].ID);
            console.log('user.id:', users[0].id);
            console.log('user.userId:', users[0].userId);
        }
        
        const userSelect = document.getElementById('assignee-user');
        if (!userSelect) {
            console.error('Элемент assignee-user не найден');
            return;
        }
        
        // Очищаем существующие опции
        userSelect.innerHTML = '<option value="" disabled selected>Выберите исполнителя</option>';
        
        // Добавляем пользователей
        users.forEach(user => {
            const option = document.createElement('option');
            // Используем правильное поле для ID
            const userId = user.ID || user.id || user.userId;
            option.value = userId;
            option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
            userSelect.appendChild(option);
            console.log(`Добавлен пользователь: ${user.firstName} ${user.lastName} с ID: ${userId}`);
        });
        
        console.log('Пользователи загружены успешно');
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        showNotification('Ошибка загрузки списка пользователей: ' + error.message, 'error');
    }
}

// Настройка обработчиков событий
function setupFormHandlers() {
    // Обработчик изменения компании
    const companySelect = document.getElementById('select-company');
    companySelect.addEventListener('change', function() {
        const companyId = this.value;
        const serverSelect = document.getElementById('select-server');
        const addServerBtn = document.getElementById('add-server-btn');
        const contactsSelect = document.getElementById('select-contacts');
        const addPhoneBtn = document.getElementById('add-phone-btn');
        
        if (companyId) {
            loadServersByCompany(companyId);
            loadPhoneNumbersByCompany(companyId);
            serverSelect.disabled = false;
            addServerBtn.disabled = false;
            contactsSelect.disabled = false;
            addPhoneBtn.disabled = false;
        } else {
            // Сброс серверов и контактов если компания не выбрана
            serverSelect.innerHTML = '<option value="" disabled selected>Сначала выберите компанию</option>';
            serverSelect.disabled = true;
            addServerBtn.disabled = true;
            contactsSelect.innerHTML = '<option value="" disabled selected>Сначала выберите компанию</option>';
            contactsSelect.disabled = true;
            addPhoneBtn.disabled = true;
        }
    });

    // Обработчик отправки формы
    const form = document.getElementById('create-request-form');
    form.addEventListener('submit', handleFormSubmit);
}

// Настройка обработчиков модальных окон
function setupModalHandlers() {
    // Кнопки открытия модальных окон
    const addCompanyBtn = document.getElementById('add-company-btn');
    const addServerBtn = document.getElementById('add-server-btn');
    const addPhoneBtn = document.getElementById('add-phone-btn');
    if (addCompanyBtn) addCompanyBtn.addEventListener('click', () => openModal('company-modal'));
    if (addServerBtn) addServerBtn.addEventListener('click', () => openModal('server-modal'));
    if (addPhoneBtn) addPhoneBtn.addEventListener('click', () => openModal('phone-modal'));

    // Кнопки закрытия модальных окон
    const closeCompanyModal = document.getElementById('close-company-modal');
    const closeServerModal = document.getElementById('close-server-modal');
    const closePhoneModal = document.getElementById('close-phone-modal');
    const cancelCompany = document.getElementById('cancel-company');
    const cancelServer = document.getElementById('cancel-server');
    const cancelPhone = document.getElementById('cancel-phone');
    if (closeCompanyModal) closeCompanyModal.addEventListener('click', () => closeModal('company-modal'));
    if (closeServerModal) closeServerModal.addEventListener('click', () => closeModal('server-modal'));
    if (closePhoneModal) closePhoneModal.addEventListener('click', () => closeModal('phone-modal'));
    if (cancelCompany) cancelCompany.addEventListener('click', () => closeModal('company-modal'));
    if (cancelServer) cancelServer.addEventListener('click', () => closeModal('server-modal'));
    if (cancelPhone) cancelPhone.addEventListener('click', () => closeModal('phone-modal'));

    // Закрытие по клику вне модального окна
    window.addEventListener('click', (event) => {
        if (event.target.classList && event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });

    // Обработчики форм создания
    const createCompanyForm = document.getElementById('create-company-form');
    const createServerForm = document.getElementById('create-server-form');
    const createPhoneForm = document.getElementById('create-phone-form');
    if (createCompanyForm) createCompanyForm.addEventListener('submit', handleCreateCompany);
    if (createServerForm) createServerForm.addEventListener('submit', handleCreateServer);
    if (createPhoneForm) createPhoneForm.addEventListener('submit', handleCreatePhone);
}

// Функции для работы с модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Фокус на первое поле ввода
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Очистка формы
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Обработчик создания компании
async function handleCreateCompany(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const companyName = formData.get('companyName').trim();
    
    if (!companyName) {
        showNotification('Введите название компании', 'error');
        return;
    }
    
    try {
        const csrf = await getCsrfToken();
        
        const companyData = {
            name: companyName
        };
        
        $.ajax({
            url: "/api/create-company",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(companyData),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function(data) {
                console.log('Компания создана:', data);
                showNotification('Компания успешно создана', 'success');
                closeModal('company-modal');
                
                // Перезагружаем список компаний
                setTimeout(() => {
                    loadCompanies();
                }, 500);
            },
            error: function(error) {
                console.error("Error:", error);
                showNotification("Ошибка создания компании: " + (error.responseJSON?.message || error.statusText), 'error');
            }
        });
        
    } catch (error) {
        console.error('Ошибка создания компании:', error);
        showNotification('Ошибка создания компании: ' + error.message, 'error');
    }
}

// Обработчик создания сервера
async function handleCreateServer(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const serverName = formData.get('serverName').trim();
    const selectedCompanyId = document.getElementById('select-company').value;
    
    if (!serverName) {
        showNotification('Введите название сервера', 'error');
        return;
    }
    
    if (!selectedCompanyId) {
        showNotification('Сначала выберите компанию', 'error');
        return;
    }
    
    try {
        const csrf = await getCsrfToken();
        
        const serverData = {
            companyID: parseInt(selectedCompanyId),
            serverName: serverName
        };
        
        console.log('Отправляем данные сервера:', serverData);
        
        $.ajax({
            url: "/api/create-server",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(serverData),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function(data) {
                console.log('Сервер создан:', data);
                showNotification('Сервер успешно создан', 'success');
                closeModal('server-modal');
                
                // Перезагружаем список серверов для выбранной компании
                setTimeout(() => {
                    loadServersByCompany(selectedCompanyId);
                }, 500);
            },
            error: function(error) {
                console.error("Error:", error);
                showNotification("Ошибка создания сервера: " + (error.responseJSON?.message || error.statusText), 'error');
            }
        });
        
    } catch (error) {
        console.error('Ошибка создания сервера:', error);
        showNotification('Ошибка создания сервера: ' + error.message, 'error');
    }
}

// Обработка отправки формы
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Отладочная информация
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    const assigneeUserId = formData.get('assigneeUserId');
    console.log('assigneeUserId from form:', assigneeUserId);
    console.log('assigneeUserId type:', typeof assigneeUserId);
    
    const requestData = {
        data: new Date().toLocaleDateString('ru-RU'),
        time: new Date().toLocaleTimeString('ru-RU'),
        tema: formData.get('tema'),
        priority: formData.get('priority'),
        companyId: parseInt(formData.get('companyId')),
        serverId: parseInt(formData.get('serverId')),
        contacts: document.getElementById('select-contacts').value,
        assigneeUserId: assigneeUserId ? parseInt(assigneeUserId) : null,
        description: formData.get('description'),
        status: 'OPEN'
    };

    console.log('Final requestData:', requestData);

    try {
        const csrf = await getCsrfToken();
        
        $.ajax({
            url: '/RequestCreate',
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function(data) {
                console.log('Request created:', data);
                showNotification(data.message, 'success');
                
                // Очищаем форму
                event.target.reset();
                document.getElementById('select-server').innerHTML = '<option value="" disabled selected>Сначала выберите компанию</option>';
                document.getElementById('select-contacts').innerHTML = '<option value="" disabled selected>Сначала выберите компанию</option>';
                
                // Перенаправляем на страницу с заявками
                setTimeout(() => {
                    window.location.hash = 'loadAllTickets';
                }, 1500);
            },
            error: function(error) {
                console.error('Error:', error);
                showNotification("Code " + error.status + " : " + error.responseJSON?.error, 'error');
            }
        });
        
    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        showNotification('Ошибка создания заявки: ' + error.message, 'error');
    }
}

// Обработчик создания номера телефона
async function handleCreatePhone(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const phoneNumber = formData.get('phoneNumber').trim();
    const selectedCompanyId = document.getElementById('select-company').value;
    
    if (!phoneNumber) {
        showNotification('Введите номер телефона', 'error');
        return;
    }
    
    if (!selectedCompanyId) {
        showNotification('Сначала выберите компанию', 'error');
        return;
    }
    
    try {
        const csrf = await getCsrfToken();
        
        const phoneData = {
            companyID: parseInt(selectedCompanyId),
            number: phoneNumber
        };
        
        console.log('Отправляем данные номера телефона:', phoneData);
        
        $.ajax({
            url: "/api/create-phoneNumber",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(phoneData),
            headers: { [csrf.headerName]: csrf.token },
            xhrFields: { withCredentials: true },
            success: function(data) {
                console.log('Номер телефона создан:', data);
                showNotification('Номер телефона успешно создан', 'success');
                closeModal('phone-modal');
                
                // Перезагружаем список номеров телефонов для выбранной компании
                setTimeout(() => {
                    loadPhoneNumbersByCompany(selectedCompanyId, phoneNumber); // обновить select и выбрать новый
                }, 500);
            },
            error: function(error) {
                console.error("Error:", error);
                showNotification("Ошибка создания номера телефона: " + (error.responseJSON?.message || error.statusText), 'error');
            }
        });
        
    } catch (error) {
        console.error('Ошибка создания номера телефона:', error);
        showNotification('Ошибка создания номера телефона: ' + error.message, 'error');
    }
}

// Тестирование API
async function testAPI() {
    try {
        console.log('Тестируем API...');
        const response = await fetch('/api/test');
        console.log('Тестовый ответ:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Тестовые данные:', data);
        } else {
            console.error('Тестовый API не работает');
        }
    } catch (error) {
        console.error('Ошибка тестирования API:', error);
    }
}
