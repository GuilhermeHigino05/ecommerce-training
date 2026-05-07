document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('login');
    btn?.addEventListener('click', login);

    const msgEl = document.getElementById('auth-message');

    function showMessage(text, type) {
        if (!msgEl) return;
        msgEl.textContent = text;
        msgEl.className = 'auth-message show ' + type;
        setTimeout(() => {
            msgEl.className = 'auth-message';
        }, 5000);
    }

    function clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }

    function login(){
        clearErrors();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        let listaValid = [];
        if(!nameInput || nameInput.value == ''){ listaValid.push(nameInput); }
        if(!emailInput || emailInput.value == ''){ listaValid.push(emailInput); }
        if(!passwordInput || passwordInput.value == ''){ listaValid.push(passwordInput); }

        if(listaValid.length === 0){
            btn.disabled = true;
            btn.textContent = 'Signing in...';

            fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value
                })
            }).then((response) => {
                    return response.json();
                })
                .then(data => {
                    if(data.ok){
                        showMessage(data.msg, 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 800);
                    }else{
                        showMessage(data.msg, 'error');
                        btn.disabled = false;
                        btn.textContent = 'Sign In';
                    }
                })
                .catch(() => {
                    showMessage('Connection error. Please try again.', 'error');
                    btn.disabled = false;
                    btn.textContent = 'Sign In';
                });
        } else{
            for(let i = 0; i < listaValid.length; i++){
                let input = listaValid[i];
                if (input) input.classList.add('input-error');
            }
            showMessage('Please fill in all fields.', 'error');
        }
    }
})