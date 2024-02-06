function showMessage(message, messageType) {
    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample);

    //toastLiveExample.querySelector('.toast-body').textContent = message;
    toastLiveExample.querySelector('.toast-body').innerHTML = message;
    toastLiveExample.querySelector('.toast-header strong').textContent = messageType;

    toast.show();
}

// 登出，刪除token
function Logout() {
    document.cookie = 'token=; Max-Age=-99999999; path=/';
    // 延時以免cookie設定錯誤
    setTimeout(function () {
        window.location.href = '/?logout=success';
    }, 300); 
}

document.getElementById('logout-button').addEventListener('click', Logout);

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const logout = urlParams.get('logout');
    if (logout === 'success') {
        showMessage('Logged out successfully', 'Success');
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const login = urlParams.get('login');
    if (login === 'success') {
        showMessage('Logged in successfully', 'Success');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const token = getCookie('token');
    
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');

    if (token) {
        // 已登入
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        // 未登入
        loginButton.style.display = 'block';
        registerButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }
});

// 提取 Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}