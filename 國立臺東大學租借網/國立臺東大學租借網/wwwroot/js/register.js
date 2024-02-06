// 註冊
function Register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('https://localhost:7204/api/AuthApi/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            showMessage('Register successful', 'Sucess');
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message === "Username already exists") {
                showMessage('The name has existed', 'Error');
            } else {
                showMessage('Register Failed', 'Error');
            }
        });
    window.location.href = '/AuthBtn/Login?Register=success';
}


// 事件綁定
document.getElementById('register-form').addEventListener('submit', Register);