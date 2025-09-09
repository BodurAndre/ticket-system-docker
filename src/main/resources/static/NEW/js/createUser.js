// Делаем функцию closeModal глобально доступной
window.closeModal = function() {
    // Удаляем модальное окно если оно существует
    const existingModal = document.getElementById('userModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Очистка всех полей формы
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('role').value = '';
    document.getElementById('dateOfBirth').value = '';

    // Снимаем выбор пола (если это radio buttons)
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => radio.checked = false);

    // Перенаправление на страницу пользователей
    setTimeout(function() {
        window.location.hash = '#users';
    }, 300);

    document.body.classList.remove('modal-open');
};

// Функция для показа модального окна
function showModal(email, password) {
    // Удаляем старое модальное окно если оно есть
    document.getElementById('userModal')?.remove();
    
    const modal = document.createElement('div');
    modal.id = 'userModal';
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
        <div style="background: #fff; border-radius: 12px; padding: 32px 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); min-width: 400px; max-width: 600px; width: 98vw; text-align: center; font-size: 1.15em;">
            <h3 style="margin-bottom: 18px; color: #27ae60;"><i class='fas fa-user-check'></i> Пользователь успешно создан!</h3>
            <p style="margin-bottom: 18px; color: #333;">Передайте следующие данные для входа пользователю:</p>
            <div style="margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                    <label style="display:block;margin-bottom:4px;color:#666;font-size:0.95em;">Email:</label>
                    <div style="font-size:1.1em;font-weight:bold;background:#f3f3f3;padding:8px 16px;border-radius:6px;font-family:monospace;">${email}</div>
                </div>
                <div>
                    <label style="display:block;margin-bottom:4px;color:#666;font-size:0.95em;">Пароль:</label>
                    <div style="font-size:1.1em;font-weight:bold;background:#f3f3f3;padding:8px 16px;border-radius:6px;font-family:monospace;">${password}</div>
                </div>
            </div>
            <button onclick="closeModal()" style="background: linear-gradient(135deg, #27ae60, #16a085); color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 1em; cursor: pointer;">Понятно</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Добавляем обработчик клика вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            window.closeModal();
        }
    });
    
    // Добавляем обработчик клавиши Escape
    document.addEventListener('keydown', function escListener(e) {
        if (e.key === 'Escape') {
            window.closeModal();
            document.removeEventListener('keydown', escListener);
        }
    });
}

// --- Валидация формы ---
function validateUserForm() {
    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    if (!firstName) {
        showNotification('Введите имя', 'error');
        return false;
    }
    if (!lastName) {
        showNotification('Введите фамилию', 'error');
        return false;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        showNotification('Введите корректный email', 'error');
        return false;
    }
    return true;
}

// --- Обработка кнопки создания пользователя ---
function initCreateUser() {
    const createUserBtn = document.getElementById('create-user');
    if (createUserBtn) {
      createUserBtn.onclick = async function() {
        if (!validateUserForm()) return;
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const gender = document.querySelector('input[name="gender"]:checked');

        const data = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
            dateOfBirth: dateOfBirth,
            gender: gender.value
        };

        try {
            const csrf = await getCsrfToken();
            $.ajax({
                url: "/createUser",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                headers: { [csrf.headerName]: csrf.token },
                xhrFields: { withCredentials: true },
                success: function (data) {
                    console.log("Request close:", data);
                    showNotification("Пользователь успешно создан!", 'success');
                    showModal(data.email, data.password); // вызов модалки
                },
                error: function (error) {
                    console.error("Error:", error);
                    const message = error.responseJSON?.message || "Неизвестная ошибка";
                    showNotification(message, 'error');
                }
            });
        } catch (error) {
            console.error("Error:", error);
            showNotification("Ошибка", 'error');
        }
      }
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

// Экспортируем функцию init
export function init() {
    initCreateUser();
}