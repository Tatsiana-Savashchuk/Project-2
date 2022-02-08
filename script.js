// Элементы страницы
const menu = document.querySelector('#menu');
const mobileMenuIcon = document.querySelector('nav button');
const mobileMenu = document.querySelector('nav');
const signIn = document.querySelector('.sign-in');
const signOut = document.querySelector('.sign-out');
const field = document.querySelector('#field');
const mainLoader = document.querySelector('main .loader');
const appointmentLoader = document.querySelector('#appointment .div-loader');
const priceLoader = document.querySelector('#price .loader');
const record = document.querySelector('#record');
const recordName = document.querySelector('#record-name');
const recordLastName = document.querySelector('#record-last-name');
const recordPhone = document.querySelector('#record-phone');
const recordService = document.querySelector('#record-service');
const recordButton = document.querySelector('#record-button');
const checkRecord = document.querySelector('#check-record');
const checkRecordName = document.querySelector('#check-record-name');
const checkRecordLastName = document.querySelector('#check-record-last-name');
const checkRecordService = document.querySelector('#check-record-service');
const checkRecordDate = document.querySelector('#check-record-date');
const checkRecordTime = document.querySelector('#check-record-time');
const checkRecordButton = document.querySelector('#check-record-button');
const home = document.querySelector('#home');
const appointment = document.querySelector('#appointment');
const checkAppointment = document.querySelector('#check-appointment');
const checkAppointmentInput = document.querySelector('#check-appointment input');
const checkAppointmentButton = document.querySelector('#check-appointment button');
const editAppointments = document.querySelector('#edit-appointments');
const calendar = document.querySelector('#calendar');
const price = document.querySelector('#price');
const contact = document.querySelector('#contact');
const login = document.querySelector('#login-form');
const loginFormLogin = document.querySelector('#login');
const loginFormPassword = document.querySelector('#password');
const loginButton = document.querySelector('#login-form button');
const tablePrice = document.querySelector('#price table');
const tableAppointment = document.querySelector('#field table');
const message = document.querySelector('#message');
const messageText = document.querySelector('#message p');
const optionList = [];
const prefix = 'https://it-academy-js-api-zmicerboksha.vercel.app/api/st/';
let currentUser = localStorage.getItem('active');
let users = JSON.parse(localStorage.getItem('users')) || {};
let isUpdateMode = false;
let thisUser;
let servicesList;
let usersList;
let currentTime;

const getDataService = async () => {
    await fetch(prefix + "service")
        .then(response => response.json())
        .then(data => {
            servicesList = [...data];
        });
}

const formList = async (URL) => {
    let list;
    await fetch(prefix + URL)
        .then(res => res.json())
        .then((items) => {
            list = [...items];
        })
    return list;
}

// Формирование селекта
const addOption = (item) => {
    const option = document.createElement('option');
    option.dataset.id = item.id;
    option.innerHTML = item.name;
    recordService.append(option);
    optionList.push(option);
}

const formOptionsList = async (URL) => {
    recordService.innerHTML = '';
    const list = await formList(URL);
    list.forEach(addOption);
}

// Сообщение
const showMessage = (text) => {
    messageText.innerHTML = text;
    message.hidden = false;
    setTimeout(() => {
        message.hidden = true;
    }, 2000);
}

// Отображение дат
const formatDate = (date) => {
    const currentDate = new Date(date);
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    return `${day}.${month}.${year}`;
}

const getDates = () => {
    const currentDate = new Date();
    const dateArray = [currentDate];
    for (let i = 0; i < 6; i++) {
        dateArray.push(currentDate.setDate(currentDate.getDate() + 1));
    }
    return dateArray.map(date => formatDate(date));
};

// Отрисовка календаря
const addTime = (date, time) => {
    const li = document.createElement('li');
    li.className = 'time';
    if (servicesList.find(service => service.date === date)) {
        const dayArray = servicesList.filter(service => service.date === date);
        if (dayArray.find(day => day.time === time)) {
            li.classList.add('busy');
        }
    }
    li.innerHTML = time;
    return li;
}

const addCalendar = async (index, ...timeArray) => {
    const dateArray = getDates();
    await getDataService();
    for (let i = index; i < dateArray.length; i++) {
        const ul = document.createElement('ul');
        ul.classList.add('day');
        ul.innerHTML = `
        <li class="date">${dateArray[i]}</li>
        `;
        for (let j = 0; j < timeArray.length; j++) {
            ul.append(addTime(dateArray[i], timeArray[j]))
        }
        calendar.append(ul);
    }
    formOptionsList("type");
}

// Отрисовка таблиц
const getTableRow = (item, tr, tableName) => {
    switch (tableName) {
        case 'type': {
            const { name, description } = item;
            return tr.innerHTML = `
                <td>${name}</td>
                <td class="center">${description || '-'}</td>
            `;
        }
        case 'service': {
            const { date, time, type, user } = item;
            return tr.innerHTML = `
                <td><textarea class="textarea-date" readonly>${date}</textarea></td>
                <td><textarea class="textarea-time" readonly>${time}</textarea></td>
                <td><textarea data-type-id="${type.id}" readonly>${type.name}</textarea></td>
                <td><textarea data-user-id="${user.id}" readonly>${user.name}</textarea></td>
                <td><textarea readonly>${user.lastName}</textarea></td>
                <td><textarea readonly>${user.phone}</textarea></td>
                <td>
                    <i class="bi bi-pencil update"></i>
                    <i class="bi bi-check-lg check-update" hidden></i>
                    <i class="bi bi-trash delete"></i>
                </td>
            `;
        }
    }
}

const addTableRow = (item, tableName) => {
    const tr = document.createElement('tr');
    tr.className = 'tr';
    tr.dataset.id = item.id;
    getTableRow(item, tr, tableName);
    switch (tableName) {
        case 'type': {
            tablePrice.append(tr);
            break;
        }
        case 'service': {
            tableAppointment.append(tr);
            break;
        }
    }
}

const renderTable = async (URL, tableName) => {
    clearTable();
    const list = await formList(URL);
    list.forEach(item => addTableRow(item, tableName));
}

// Очистка таблиц
const clearTable = () => {
    if (!!document.querySelector('tr.tr')) {
        document.querySelectorAll('tr.tr').forEach(item => item.remove());
    }
}

// Редактирование таблицы администратора
const switchMode = element => {
    const update = element.querySelector('.update');
    const checkUpdate = element.querySelector('.check-update')
    if (!isUpdateMode) {
        update.hidden = true;
        checkUpdate.hidden = false;
        return isUpdateMode = true;
    }
    if (isUpdateMode) {
        update.hidden = false;
        checkUpdate.hidden = true;
        return isUpdateMode = false;
    }
}

const deleteService = async (id) => {
    await fetch(prefix + `service/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(() => {
            renderTable("service", 'service');
        })
}

const updateService = async (id, data) => {
    await fetch(prefix + `service/${id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(() => {
            renderTable("service", 'service');
        })
}

const deleteAppointment = async (element) => {
    const id = element.closest('tr').dataset.id;
    try {
        await deleteService(id);
    } catch {
        showMessage('Execution error. Please refresh the page and try again');
    }
}

const updateAppointment = element => {
    const currentTr = element.closest('tr');
    const textareasList = currentTr.querySelectorAll('textarea');
    switchMode(currentTr);
    textareasList.forEach(item => {
        if (item.className === 'textarea-date' || item.className === 'textarea-time') {
            item.readOnly = false
        }
    });
}

const checkApdateAppointment = async (element) => {
    const currentTr = element.closest('tr');
    const id = currentTr.dataset.id;
    const textareasList = currentTr.querySelectorAll('textarea');
    switchMode(currentTr);
    textareasList.forEach(item => item.readOnly = true);

    const dataService = {
        typeId: +textareasList[2].dataset.typeId,
        userId: +textareasList[3].dataset.userId,
        date: textareasList[0].value,
        time: textareasList[1].value,
    }

    try {
        await updateService(id, dataService);
    } catch {
        showMessage('Execution error. Please refresh the page and try again');
    }
}

// Вход и выход администратора
const getLogin = async () => {
    await fetch(prefix + 'user/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            login: loginFormLogin.value,
            password: loginFormPassword.value,
        }),
    })
        .then(res => res.json())
        .then((result) => {
            if (result.statusCode === 200) {
                currentUser = loginFormLogin.value;
                localStorage.setItem('active', loginFormLogin.value);
                signIn.hidden = true;
                signOut.hidden = false;
                window.history.back();
            } else {
                showMessage(result.message);
            }
        })
}

const signOutAdmin = () => {
    login.hidden = true;
    tableAppointment.hidden = true;
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('active');
    signIn.hidden = false;
    signOut.hidden = true;
    loginFormLogin.value = '';
    loginFormPassword.value = '';
}

// Валидация телефона
const isPhone = (phone) => {
    return phone && phone.length === 13 && phone[0] === '+' && !isNaN(phone.replace('+', ''))
}

// Очистка формы записи
const clearForm = () => {
    record.hidden = true;
    currentTime.style.borderColor = 'transparent';
    recordName.value = '';
    recordLastName.value = '';
    recordPhone.value = '';
}

// Отрисовка таблицы администратора
const openAppointmentTable = async () => {
    if (currentUser) {
        tableAppointment.hidden = false;
        clearTable();
        await renderTable("service", 'service');
    }
}

// Создание клиента
const addUser = async (URL, data) => {
    await fetch(prefix + URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(user => thisUser = user)
    return thisUser;
}

// Создание записи
const addService = async (URL, data) => {
    await fetch(prefix + URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
}

const openRecordForm = element => {
    checkRecord.hidden = true;
    record.hidden = false;
    if (currentUser) {
        tableAppointment.hidden = true;
    }
    element.style.borderColor = '#75a2a5';
    if (currentTime) {
        currentTime.style.borderColor = 'transparent';
        if (currentTime === element) {
            record.hidden = true;
            if (currentUser) {
                tableAppointment.hidden = false;
            }
        }
    }
    return currentTime = element;
}

const getDataUser = async () => {
    await fetch(prefix + "user")
        .then(response => response.json())
        .then(data => {
            usersList = [...data];
        });
    return usersList;
}

const createAppointment = async () => {
    await getDataUser();
    thisUser = usersList.find(user => user.phone === recordPhone.value);
    if (!thisUser) {
        const dataUser = {
            name: recordName.value,
            lastName: recordLastName.value || '-',
            phone: recordPhone.value,
        }
        await addUser("user", dataUser);
    }

    if (thisUser.services && thisUser.services.length !== 0) {
        showMessage('Unable to record. You have already signed up');
        currentTime.style.borderColor = 'transparent';
        clearForm();
        return;
    }

    const dataService = {
        typeId: +optionList.find(item => item.selected).dataset.id,
        userId: +thisUser.id,
        date: currentTime.closest('ul').querySelector('.date').innerHTML,
        time: currentTime.innerHTML,
    }

    try {
        record.hidden = true;
        mainLoader.hidden = false;
        await addService("service", dataService);
        clearForm();
        mainLoader.hidden = true;
        currentTime.style.borderColor = 'transparent';
        showMessage('Thanks! The master will contact you within 24 hours to confirm the appointment');
    } catch {
        record.hidden = false;
        showMessage('Error! Check the entered data');
    }
}

// Проверка записи
const showAppointment = (appointment) => {
    checkRecord.hidden = false;
    tableAppointment.hidden = true;
    checkRecordName.innerHTML = appointment.user.name;
    checkRecordLastName.innerHTML = appointment.user.lastName || '-';
    checkRecordService.innerHTML = appointment.type.name;
    checkRecordTime.innerHTML = appointment.time;
    checkRecordDate.innerHTML = appointment.date;
    checkAppointmentInput.value = '';
}

const getAppointment = async () => {
    try {
        mainLoader.hidden = false;
        await getDataService();
        mainLoader.hidden = true;
        const newServicesList = servicesList.find(item => item.user.phone === checkAppointmentInput.value);
        if (newServicesList) {
            record.hidden = true;
            if (currentTime) {
                currentTime.style.borderColor = 'transparent';
            }
            showAppointment(newServicesList);
        } else {
            showMessage('You have no record');
            checkAppointmentInput.value = '';
        }
    } catch {
        showMessage('Error! Check the entered data');
        await openAppointmentTable();
    }
}

// Переключение окон
const handleLogin = () => {
    if (currentUser) {
        signOut.hidden = false;
        signIn.hidden = true;
    } else {
        signOut.hidden = true;
        signIn.hidden = false;
    }
    record.hidden = true;
}

const handleLoginForm = () => {
    login.hidden = false;
}

const handleHome = () => {
    handleLogin();
    home.hidden = false;
    login.hidden = true;
    checkRecord.hidden = true;
}

const handleAppointment = async () => {
    await openAppointmentTable();
    handleLogin();
    calendar.innerHTML = '';
    appointmentLoader.hidden = false;
    appointment.hidden = false;
    await addCalendar(2, '09.00', '11.00', '13.00', '16.00');
    appointmentLoader.hidden = true;
    login.hidden = true;
}

const handlePrice = async () => {
    handleLogin();
    clearTable();
    price.hidden = false;
    priceLoader.hidden = false;
    await renderTable("type", 'type');
    priceLoader.hidden = true;
    login.hidden = true;
    tableAppointment.hidden = true;
    checkRecord.hidden = true;
}

const handleContact = () => {
    handleLogin();
    contact.hidden = false;
    login.hidden = true;
    tableAppointment.hidden = true;
    checkRecord.hidden = true;
}

const locationChanged = () => {
    home.hidden = true;
    login.hidden = true;
    appointment.hidden = true;
    price.hidden = true;
    contact.hidden = true;
    tableAppointment.hidden = true;
    record.hidden = true;
    checkRecord.hidden = true;
    message.hidden = true;
    mainLoader.hidden = true;
    appointmentLoader.hidden = true;
    priceLoader.hidden = true;
    mobileMenu.classList.remove('open');

    switch (location.hash) {
        case '#home':
        case '': {
            handleHome();
            break;
        }
        case '#appointment': {
            handleAppointment();
            break;
        }
        case '#price': {
            handlePrice();
            break;
        }
        case '#contact': {
            handleContact();
            break;
        }
        case '#login': {
            handleLoginForm();
            break;
        }
        default: {
            home.hidden = false;
        }
    }
}

// Меню
mobileMenuIcon.addEventListener('click', event => {
    mobileMenu.classList.toggle('open');
})

// Вход и выход администратора
menu.addEventListener('click', async (event) => {
    if (event.target.classList.contains('sign-in')) {
        location.href = '#login';
    }
    if (event.target.classList.contains('sign-out')) {
        signOutAdmin();
    }
})

loginButton.addEventListener('click', async (e) => {
    if (loginFormLogin.value && loginFormPassword.value) {
        await getLogin();
    } else {
        showMessage('Wrong login or password');
    }
})

// Редактирование таблицы администратора
tableAppointment.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {
        await deleteAppointment(event.target);
        return;
    }

    if (event.target.classList.contains('update')) {
        updateAppointment(event.target);
        return;
    }

    if (event.target.classList.contains('check-update')) {
        await checkApdateAppointment(event.target);
        return;
    }
})

// Создание записи
calendar.addEventListener('click', event => {
    if (event.target.classList.contains('time')) {
        openRecordForm(event.target);
    }
})

recordButton.addEventListener('click', async (e) => {
    if (recordName.value && isPhone(recordPhone.value)) {
        await createAppointment();
    } else {
        showMessage('You have not entered the data or entered it incorrectly!');
    }
})

// Проверка записи
checkAppointmentButton.addEventListener('click', async (e) => {
    if (isPhone(checkAppointmentInput.value)) {
        await getAppointment();
    } else {
        showMessage('You have not entered the data or entered it incorrectly!');
        await openAppointmentTable();
    }
})

checkRecordButton.addEventListener('click', async (e) => {
    checkRecord.hidden = true;
    await openAppointmentTable();
})

window.addEventListener('hashchange', locationChanged);
locationChanged();
