document.addEventListener('DOMContentLoaded', () => {
    let btnExcluir = document.querySelectorAll('.btnExcluir');
    btnExcluir.forEach(btn => {
        btn.addEventListener('click', deleteProduct);
    })
    
    function deleteProduct() {
        let id = this.dataset.id;
        fetch(`/admin/products/delete/${id}`, {
            method: 'DELETE'
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.ok) {
                alert(data.msg);
                window.location.reload();
            } else {
                alert(data.msg);
            }
        });
    }

})