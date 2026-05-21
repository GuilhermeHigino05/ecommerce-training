
document.addEventListener('DOMContentLoaded', () => {
    let listaCarrinho = [];
    let carrinho = localStorage.getItem('cart');
    if(carrinho) listaCarrinho = JSON.parse(carrinho);
    atualizarContador();

    let btnRequest = document.getElementById('realizarPedido');
    btnRequest.addEventListener('click', request);

    function request(){
        if(listaCarrinho.length >0){
            fetch('/request', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(listaCarrinho)
            }).then(response => {
                return response.json()
            }).then(data => {
                if(data.ok){
                    alert(data.msg)
                    window.location.reload()
                }else{
                    alert(data.msg)
                }
            })
        }
    }

    let btns = document.querySelectorAll('.btn-add-to-cart');
    btns.forEach(btn => {
        btn.addEventListener('click', addToCart);
    })

    document.addEventListener('show.bs.modal', openCart);

    function deleteCart(id){
        id = (typeof id === 'string' || typeof id === 'number') ? id : this.dataset.id;
        listaCarrinho = listaCarrinho.filter(x => x.tb_pro_id != id);
        localStorage.setItem('cart', JSON.stringify(listaCarrinho));
        atualizarContador();
        openCart();
        calculateTotalValue();
    }

    function addQtd(){
        let id = this.dataset.id;
        for(let i = 0; i< listaCarrinho.length;i++){
            if(listaCarrinho[i].tb_pro_id == id){
                if(listaCarrinho[i].tb_pro_qtd >= 999){
                    alert('Você atingiu a quantidade maxíma desse produto')
                }else{
                    listaCarrinho[i].tb_pro_qtd += 1;
                    localStorage.setItem('cart', JSON.stringify(listaCarrinho));
                    openCart();
                    calculateTotalValue();
                }
            }
        }
    }   

    function remQtd(){
        let id = this.dataset.id

        if(id){
            for(let i =0;i<listaCarrinho.length;i++){
                if(listaCarrinho[i].tb_pro_id == id){
                    if(listaCarrinho[i].tb_pro_qtd <=1){
                        deleteCart(id);
                    }else{
                        listaCarrinho[i].tb_pro_qtd -= 1;
                        localStorage.setItem('cart', JSON.stringify(listaCarrinho));
                        openCart();
                        calculateTotalValue();
                    }
                }
            }
        }
    }

    function calculateTotalValue(){
        let totalValue = 0;

        for(let i = 0; i<listaCarrinho.length;i++){
            totalValue += listaCarrinho[i].tb_pro_price * listaCarrinho[i].tb_pro_qtd;
        }

        document.querySelector('#valorTotalPedido').innerHTML = totalValue.toFixed(2);
    }


    function openCart(){
        if(listaCarrinho.length >0){
            let html = `
                    <table class="table table-dark table-striped table-hover table-responsive">
                            <thead>
                                <tr>
                                    <th>Imagem</th>
                                    <th>Nome</th>
                                    <th>Valor Unitário</th>
                                    <th>Quantidade</th>
                                    <th>Valor Total</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {body}
                            </tbody>
                        </table>
                        `
            let body = '';
            for(let i = 0 ; i< listaCarrinho.length; i++){
                body += `
                        <tr>
                            <td><img width="50" src="${listaCarrinho[i].tb_pro_img}" /></td>
                            <td>${listaCarrinho[i].tb_pro_name}</td>
                            <td>${listaCarrinho[i].tb_pro_price}</td>
                            <td> <button type="button" class="btn btn-primary addQtd" data-id="${listaCarrinho[i].tb_pro_id}">+</button>  ${listaCarrinho[i].tb_pro_qtd} <button type="button" class="btn btn-secondary remQtd" data-id="${listaCarrinho[i].tb_pro_id}">-</button></td>
                            <td>${listaCarrinho[i].tb_pro_qtd * listaCarrinho[i].tb_pro_price}</td>
                            <td><button data-id="${listaCarrinho[i].tb_pro_id}" class="btn btn-danger excluirCarrinho">DEL</button></td>
                        </tr>
                    `
            }
            html = html.replace('{body}', body);
            document.getElementById('modalCarrinhoCorpo').innerHTML = html;
            let btnsExcluir = document.querySelectorAll('.excluirCarrinho');
            btnsExcluir.forEach(value => {
                value.addEventListener('click', deleteCart);
            })

            let btnAdd = document.querySelectorAll('.addQtd');
            btnAdd.forEach(value => {
                value.addEventListener('click', addQtd)
            })
            let btnRem = document.querySelectorAll('.remQtd');
            btnRem.forEach(value => {
                value.addEventListener('click', remQtd)
            })
            
        }else{
            document.getElementById('modalCarrinhoCorpo').innerHTML = "Cart don't have products"
        }
    }

    function atualizarContador(){
        let cont = document.getElementById('contadorCarrinho');
        let total = listaCarrinho.length || 0;
        cont.innerHTML = total;
    }


    function addToCart(){
        let produtoId = this.dataset.id;
        let that = this;
        let p = null
        if(produtoId){
            let achou = false;
            for(let i = 0; i < listaCarrinho.length; i++){
                if(listaCarrinho[i].tb_pro_id == produtoId){
                    listaCarrinho[i].tb_pro_qtd += 1;
                    achou = true;
                }
            }
            if(!achou){
                p = fetch('/obter/' + produtoId)
                .then(response => {
                    return response.json();
                }). then(data => {
                    data.product.tb_pro_qtd = 1;
                    listaCarrinho.push(data.product);
                })
            }
            Promise.all([p])
            .then(() => {
                localStorage.setItem('cart', JSON.stringify(listaCarrinho));
                that.innerHTML = "<i class='fas fa-check'></i> Added!";
                setTimeout(() => {
                    that.innerHTML = "<i class='bi-cart-fill me-1'></i> Add to Cart"
                }, 500);
                atualizarContador();
                calculateTotalValue();
            })
        
        }else{
                alert('Produto não encontrado');
        }
    }
})