document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('register');
    btn?.addEventListener('click', register);

    function register(){
        const nameInput = document.getElementById('name');
        nameInput.style.borderColor = '#ce3dacc';
        const emailInput = document.getElementById('email');
        emailInput.style.borderColor = '#ce3dacc';
        const phoneInput = document.getElementById('phone');
        phoneInput.style.borderColor = '#ce3dacc';
        const passwordInput = document.getElementById('password');
        passwordInput.style.borderColor = '#ce3dacc';

        let listaValid = [];
        if(!nameInput || nameInput.value == ''){ listaValid.push(nameInput); }
        if(!emailInput || emailInput.value == ''){ listaValid.push(emailInput); }
        if(!phoneInput || phoneInput.value == ''){ listaValid.push(phoneInput); }
        if(!passwordInput || passwordInput.value == ''){ listaValid.push(passwordInput); }

        if(listaValid.length === 0){
            fetch('/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    phone: phoneInput.value,
                    password: passwordInput.value
                })
            }).then((response) => {
                    return response.json();
                })
                .then(data => {
                    if(data.ok){
                        window.location.href = '/';
                    }else{
                        alert(data.msg);
                    }
                })
        } else{
            for(let i = 0; i < listaValid.length; i++){
                let input = listaValid[i];
                input.style.borderColor = 'red';
            }
        }
    }
})