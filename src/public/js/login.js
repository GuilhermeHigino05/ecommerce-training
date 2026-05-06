document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('login');
    btn?.addEventListener('click', login);

    function login(){
        const nameInput = document.getElementById('name');
        nameInput.style.borderColor = '#ce3dacc';
        const emailInput = document.getElementById('email');
        emailInput.style.borderColor = '#ce3dacc';
        const passwordInput = document.getElementById('password');
        passwordInput.style.borderColor = '#ce3dacc';

        let listaValid = [];
        if(!nameInput || nameInput.value == ''){ listaValid.push(nameInput); }
        if(!passwordInput || passwordInput.value == ''){ listaValid.push(passwordInput); }
        if(!emailInput || emailInput.value == ''){ listaValid.push(emailInput); }


        if(listaValid.length === 0){
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
                        alert(data.msg)
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