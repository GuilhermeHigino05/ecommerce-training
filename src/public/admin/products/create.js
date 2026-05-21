

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('createBtn');

    btn?.addEventListener('click', createProduct);
    const img = document.getElementById('img') ;
    img?.addEventListener('change', changeImg);
})

function changeImg() {
    const img = document.getElementById('img');
    let arquivo = img?.files?.[0];
    if (!arquivo) return;
    let extensao = arquivo.type.split('/')[1];
    if (extensao === 'jpeg' || extensao === 'jpg' || extensao === 'png' || extensao === 'webp') {
        let url = URL.createObjectURL(arquivo);
    } else {
        alert("Imagem com formato inválido! Selecione JPG, PNG ou WebP");
    }
}
function createProduct() {

        const nameInput = document.getElementById('name');
        nameInput.style.borderColor = '#ce3dacc';
        const priceInput = document.getElementById('price');
        priceInput.style.borderColor = '#ce3dacc';
        const descriptionInput = document.getElementById('description');
        const quantityInput = document.getElementById('quantity');
        descriptionInput.style.borderColor = '#ce3dacc';
        quantityInput.style.borderColor = '#ce3dacc';
        const img = document.getElementById('img') ;
        img.style.borderColor = '#ce3dacc';


        let listaValid = []

        if (nameInput?.value == '') {
            listaValid.push('name')
        }

        if (priceInput?.value == '') {
            listaValid.push('price')
        }

        if (descriptionInput?.value == '') {
            listaValid.push('description')
        }

        if (quantityInput?.value == '') {
            listaValid.push('quantity')
        }

        if(listaValid.length == 0){

            let formData = new FormData();
            formData.append('name', nameInput?.value ?? '');
            formData.append('price', priceInput?.value ?? '');
            formData.append('description', descriptionInput?.value ?? '');
            formData.append('quantity', quantityInput?.value ?? '');
            formData.append('img', img?.files?.[0] ?? '');
            
            fetch('/admin/products/create', {
                method: 'POST',
                body:  formData
            }).then(response => {
                return response.json();
            }).then(data => {
                if(data.ok){
                    alert(data.msg);
                    window.location.href = '/admin/products/';
                }else{
                    alert(data.msg);
                }
            })
        }else{
            for (let i = 0; i < listaValid.length; i++) {
                let campo = document.getElementById(listaValid[i]);
                campo.style.borderColor = 'red';
            }
        }
    }


