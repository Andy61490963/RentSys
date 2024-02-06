// 登入
function Login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    fetch('https://localhost:7204/api/AuthApi/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (response.ok) {
                return response.json(); 
            } else {
                throw new Error('Unauthorized'); 
            }
        })
        .then(data => {           
            document.cookie = `token=${data.token};path=/;max-age=604800`; 
            showMessage('Login Successful', 'Success');
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Login Failed', 'Error');
        });
    //window.location.href = '/?login=success';
    // 延時以免cookie設定錯誤
    setTimeout(function () {
        window.location.href = '/?login=success';
    }, 300); 

}

// 提取 Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 註冊成功跳轉登入
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const Register = urlParams.get('Register');
    if (Register === 'success') {
        showMessage('Register successfully', 'Success');
    }
});

// 事件綁定
document.getElementById('login-form').addEventListener('submit', Login);