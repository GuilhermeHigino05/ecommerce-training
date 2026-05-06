# 📸 Guia Completo: Upload de Imagens com Multer

## Índice

1. [O que é o Multer?](#1---o-que-é-o-multer)
2. [Instalação](#2---instalação)
3. [Configuração do Multer (diskStorage)](#3---configuração-do-multer-diskstorage)
4. [Usando o Multer como Middleware na Rota](#4---usando-o-multer-como-middleware-na-rota)
5. [Recebendo o Arquivo no Controller](#5---recebendo-o-arquivo-no-controller)
6. [Enviando a Imagem pelo Front-End (FormData)](#6---enviando-a-imagem-pelo-front-end-formdata)
7. [Exibindo Imagens com Base64](#7---exibindo-imagens-com-base64)
8. [Fluxo Completo Resumido](#8---fluxo-completo-resumido)

---

## 1 - O que é o Multer?

O **Multer** é um middleware para Express que lida com `multipart/form-data`, o formato usado para envio de **arquivos** (imagens, PDFs, etc.) via formulários HTML.

> ⚠️ O `express.json()` e o `express.urlencoded()` **NÃO** conseguem processar arquivos binários. Eles só leem dados de texto (campos de formulário normais). Por isso precisamos do Multer.

### Por que salvar em disco?

| Estratégia | Onde salva | Vantagens | Desvantagens |
|---|---|---|---|
| **💾 Disco (Multer)** | Pasta no servidor (ex: `public/uploads/`) | Simples, rápido, gratuito | Não escala em múltiplos servidores |
| **🗄️ Banco (BLOB)** | Coluna no MySQL | Tudo em um só lugar | Banco fica pesado e lento |
| **☁️ Nuvem** | AWS S3, Google Cloud, etc. | Escala infinitamente | Custa dinheiro, mais complexo |

Para fins de estudo e projetos pequenos, **salvar em disco é a melhor opção**.

---

## 2 - Instalação

```bash
# Instalar o Multer
npm install multer

# Instalar os tipos para TypeScript
npm install -D @types/multer
```

No nosso projeto, o `package.json` já tem essas dependências:

```json
{
  "dependencies": {
    "multer": "^2.1.1"
  },
  "devDependencies": {
    "@types/multer": "^2.1.0"
  }
}
```

---

## 3 - Configuração do Multer (diskStorage)

O Multer precisa saber **duas coisas**:
1. **Onde** salvar o arquivo (`destination`)
2. **Com qual nome** salvar (`filename`)

### Criando o arquivo de configuração

Crie um arquivo em `src/middleware/multerConfig.ts`:

```typescript
// src/middleware/multerConfig.ts

import multer from 'multer';
import path from 'path';

// ┌─────────────────────────────────────────────────────┐
// │  diskStorage = salvar o arquivo fisicamente no disco │
// └─────────────────────────────────────────────────────┘
const storage = multer.diskStorage({

    // 1) ONDE salvar? → pasta 'src/public/uploads'
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads');
        //  ↑ null = sem erro
        //              ↑ caminho da pasta de destino
    },

    // 2) COM QUAL NOME salvar?
    filename: (req, file, cb) => {
        // Gera um nome único para evitar conflitos:
        // Exemplo: 1714588594000-foto-produto.jpg
        const nomeUnico = Date.now() + '-' + file.originalname;
        cb(null, nomeUnico);
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Lista de tipos MIME permitidos
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);  // ✅ Aceita o arquivo
    } else {
        cb(null, false); // ❌ Rejeita o arquivo (formato inválido)
    }
};

// Exporta o middleware configurado
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // Limite de 5MB por arquivo
    }
});

export default upload;
```

### Explicação dos parâmetros do `diskStorage`:

```
multer.diskStorage({
    destination: (req, file, cb) => { ... },
    filename:    (req, file, cb) => { ... }
})
```

| Parâmetro | O que é |
|---|---|
| `req` | O objeto da requisição (Request do Express) |
| `file` | Informações do arquivo enviado (nome, tipo, tamanho) |
| `cb` | Callback — função que você chama para "responder" ao Multer |

O callback `cb` sempre segue o padrão: `cb(erro, valor)`
- `cb(null, 'src/public/uploads')` → sem erro, salva nesta pasta
- `cb(new Error('...'), '')` → com erro, rejeita o upload

### Propriedades do objeto `file`:

```typescript
file.originalname  // "foto-produto.jpg" (nome original)
file.mimetype      // "image/jpeg" (tipo do arquivo)
file.size          // 204800 (tamanho em bytes)
file.filename      // "1714588594000-foto-produto.jpg" (nome no disco, após salvar)
file.path          // "src/public/uploads/1714588594000-foto-produto.jpg" (caminho completo)
```

---

## 4 - Usando o Multer como Middleware na Rota

O Multer funciona como um **middleware** — ele fica entre a requisição e o controller, processando o arquivo antes do controller receber os dados.

### Arquivo de rotas: `src/Routes/admin/productsRoute.ts`

```typescript
// src/Routes/admin/productsRoute.ts

import express from 'express';
import ProductsController from '../../Controller/admin/ProductsController';
import upload from '../../middleware/multerConfig';  // ← importa o Multer configurado

const router = express.Router();
const productsController = new ProductsController();

router.get('/create', productsController.CreateView);

// upload.single('img') → espera UM arquivo no campo chamado 'img'
//                                                          ↓
router.post('/create', upload.single('img'), productsController.Create);
//                     └──── middleware ────┘ └──── controller ────┘

export default router;
```

### Tipos de upload disponíveis:

| Método | Uso | Exemplo |
|---|---|---|
| `upload.single('campo')` | **Um** arquivo | Upload de foto de perfil |
| `upload.array('campo', max)` | **Vários** arquivos, mesmo campo | Galeria de fotos |
| `upload.fields([...])` | **Vários** arquivos, campos diferentes | Foto + documento |
| `upload.none()` | **Nenhum** arquivo (só texto) | Formulário sem imagem |

### Fluxo da requisição:

```
Cliente envia POST ──▶ upload.single('img') ──▶ ProductsController.Create
                       │                        │
                       │ 1. Lê o arquivo         │ Agora pode acessar:
                       │ 2. Salva no disco       │   req.file  → dados do arquivo
                       │ 3. Preenche req.file    │   req.body  → campos de texto
                       │ 4. Passa pro próximo    │
```

---

## 5 - Recebendo o Arquivo no Controller

Depois que o Multer processa a requisição, as informações ficam disponíveis em:
- `req.file` → dados do **arquivo** enviado
- `req.body` → dados dos **campos de texto** (name, price, description)

### Controller: `src/Controller/admin/ProductsController.ts`

```typescript
// src/Controller/admin/ProductsController.ts

import { Request, Response } from 'express';
import ProductModel from '../../Model/admin/ProductsModel';

class ProductsController {

    public async CreateView(req: Request, res: Response) {
        res.render('admin/products/create.html');
    }

    public async Create(req: Request, res: Response) {
        const { name, price, description } = req.body;

        // ┌──────────────────────────────────────────────────┐
        // │ O Multer coloca as informações do arquivo        │
        // │ no objeto req.file (não no req.body!)            │
        // └──────────────────────────────────────────────────┘
        const arquivo = req.file;

        try {
            if (!name || !price || !description || !arquivo) {
                res.send({ ok: false, msg: 'Dados inválidos' });
                return;
            }

            // Salva apenas o CAMINHO da imagem no banco de dados
            // Exemplo: "/uploads/1714588594000-foto-produto.jpg"
            const caminhoImagem = '/uploads/' + arquivo.filename;

            const product = new ProductModel(0, name, price, description, caminhoImagem);
            const result = await product.Create();

            if (result) {
                res.send({ ok: true, msg: 'Produto cadastrado com sucesso!' });
            } else {
                res.send({ ok: false, msg: 'Erro ao cadastrar produto!' });
            }
        } catch (error) {
            res.send({ ok: false, msg: 'Erro ao cadastrar produto!' });
        }
    }
}

export default ProductsController;
```

### ⚠️ Ponto Importante

No banco de dados, **NÃO salvamos a imagem em si** — salvamos apenas o **caminho** (uma string). A imagem real fica salva fisicamente na pasta `src/public/uploads/`.

```
MySQL (tabela produtos):
┌────┬──────────┬───────┬────────────┬─────────────────────────────────────────┐
│ id │ nome     │ preco │ descricao  │ imagem                                  │
├────┼──────────┼───────┼────────────┼─────────────────────────────────────────┤
│  1 │ Camiseta │ 49.90 │ Algodão... │ /uploads/1714588594000-camiseta.jpg     │
│  2 │ Tênis    │ 199.0 │ Corrida... │ /uploads/1714588601234-tenis.png        │
└────┴──────────┴───────┴────────────┴─────────────────────────────────────────┘

Disco (pasta src/public/uploads/):
├── 1714588594000-camiseta.jpg   ← arquivo real da imagem
├── 1714588601234-tenis.png      ← arquivo real da imagem
```

Como temos `app.use(express.static('src/public'))` no `server.ts`, o Express serve esses arquivos automaticamente. Então acessar `http://localhost:5000/uploads/1714588594000-camiseta.jpg` retorna a imagem.

---

## 6 - Enviando a Imagem pelo Front-End (FormData)

No navegador, usamos `FormData` para enviar arquivos. **Não podemos usar JSON** para enviar arquivos binários.

### Arquivo: `src/public/admin/products/create.ts`

```typescript
// src/public/admin/products/create.ts

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('createBtn');
    btn?.addEventListener('click', createProduct);

    const img = document.getElementById('img') as HTMLInputElement | null;
    img?.addEventListener('change', changeImg);
});

// ┌──────────────────────────────────────────────┐
// │  Validar o formato da imagem antes de enviar │
// └──────────────────────────────────────────────┘
function changeImg() {
    const img = document.getElementById('img') as HTMLInputElement | null;
    let arquivo = img?.files?.[0];
    if (!arquivo) return;

    let extensao = arquivo.type.split('/')[1];
    // arquivo.type = "image/jpeg" → extensao = "jpeg"

    if (extensao === 'jpeg' || extensao === 'jpg' || extensao === 'png' || extensao === 'webp') {
        // ✅ Formato válido — pode mostrar preview (ver seção Base64)
        let url = URL.createObjectURL(arquivo);
        // Pode usar essa url para mostrar um preview da imagem
    } else {
        // ❌ Formato inválido
        alert("Imagem com formato inválido! Selecione JPG, PNG ou WebP");
    }
}

// ┌──────────────────────────────────────────────┐
// │  Enviar o produto com a imagem para o server │
// └──────────────────────────────────────────────┘
function createProduct() {
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const priceInput = document.getElementById('price') as HTMLInputElement | null;
    const descriptionInput = document.getElementById('description') as HTMLInputElement | null;
    const img = document.getElementById('img') as HTMLInputElement | null;

    // Validação dos campos...
    if (!nameInput?.value || !priceInput?.value || !descriptionInput?.value) {
        alert('Preencha todos os campos!');
        return;
    }

    // ┌────────────────────────────────────────────────────────────┐
    // │  FormData é OBRIGATÓRIO para enviar arquivos via fetch!    │
    // │  Não funciona com JSON.stringify()                         │
    // └────────────────────────────────────────────────────────────┘
    let formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('price', priceInput.value);
    formData.append('description', descriptionInput.value);

    // O nome 'img' PRECISA ser o mesmo que está no upload.single('img') da rota!
    //                                                              ↓
    formData.append('img', img?.files?.[0] ?? '');
    //               ↑ este nome deve bater com o nome no Multer

    fetch('/admin/products/create', {
        method: 'POST',
        body: formData
        // ⚠️ NÃO coloque Content-Type aqui!
        // O navegador define automaticamente como:
        // Content-Type: multipart/form-data; boundary=----xxxxx
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.ok) {
            alert(data.msg);
            window.location.href = '/admin/products/';
        } else {
            alert(data.msg);
        }
    });
}
```

### ⚠️ Armadilhas comuns:

1. **NÃO defina `Content-Type` manualmente** no fetch. O navegador precisa gerar o `boundary` automaticamente.
2. O nome em `formData.append('img', ...)` **DEVE** ser igual ao nome em `upload.single('img')`.
3. Não tente converter o arquivo para JSON — use `FormData`.

---

## 7 - Exibindo Imagens com Base64

### O que é Base64?

Base64 é uma forma de representar dados binários (como uma imagem) usando apenas **caracteres de texto** (letras, números e símbolos).

```
Imagem original (binário):  01001010 01000110 01001001 01000110 ...
Imagem em Base64 (texto):   /9j/4AAQSkZJRgABAQEASABIAAD/2wBDAA...
```

### Quando usar cada abordagem?

| Abordagem | Quando usar | Exemplo |
|---|---|---|
| **Caminho no disco** | Imagem já salva no servidor | `<img src="/uploads/foto.jpg">` |
| **Base64** | Preview antes de salvar, ou imagens pequenas | `<img src="data:image/jpeg;base64,/9j/4AA...">` |

### 7.1 - Preview da imagem NO NAVEGADOR (antes de enviar)

Usa `FileReader` para converter o arquivo selecionado em Base64 e mostrar um preview:

```typescript
function changeImg() {
    const imgInput = document.getElementById('img') as HTMLInputElement | null;
    const preview = document.getElementById('preview') as HTMLImageElement | null;
    
    let arquivo = imgInput?.files?.[0];
    if (!arquivo) return;

    // Validar extensão
    let extensao = arquivo.type.split('/')[1];
    if (!['jpeg', 'jpg', 'png', 'webp'].includes(extensao)) {
        alert("Formato inválido!");
        return;
    }

    // ┌──────────────────────────────────────────────────────┐
    // │  FileReader lê o arquivo e converte para Base64      │
    // └──────────────────────────────────────────────────────┘
    const reader = new FileReader();

    // Quando terminar de ler, executa esta função:
    reader.onload = (e) => {
        if (preview && e.target?.result) {
            // e.target.result contém a string Base64 completa:
            // "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
            preview.src = e.target.result as string;
        }
    };

    // Inicia a leitura do arquivo como Data URL (Base64)
    reader.readAsDataURL(arquivo);
    //     └──── este método converte para Base64 ────┘
}
```

No HTML, adicione um `<img>` para o preview:

```html
<!-- Formulário de criação -->
<input type="file" id="img" accept="image/*">

<!-- Preview da imagem selecionada -->
<img id="preview" src="" alt="Preview" style="max-width: 300px; display: none;">
```

### 7.2 - Exibindo imagem salva no banco (caminho do disco)

Quando a imagem já está salva na pasta `uploads/` e o caminho está no banco de dados, basta usar o caminho diretamente:

```html
<!-- No template EJS -->
<!-- produto.imagem = "/uploads/1714588594000-camiseta.jpg" -->

<img src="<%= produto.imagem %>" alt="<%= produto.nome %>">

<!-- O Express serve o arquivo automaticamente por causa do: -->
<!-- app.use(express.static('src/public')) no server.ts -->
```

### 7.3 - Convertendo imagem do disco para Base64 no SERVIDOR

Caso precise retornar a imagem como Base64 (por exemplo, para uma API):

```typescript
import fs from 'fs';
import path from 'path';

// Ler o arquivo do disco e converter para Base64
function imagemParaBase64(caminhoRelativo: string): string {
    // Monta o caminho completo
    // caminhoRelativo = "/uploads/1714588594000-foto.jpg"
    const caminhoCompleto = path.join('src/public', caminhoRelativo);

    // Lê o arquivo como Buffer (dados binários)
    const buffer = fs.readFileSync(caminhoCompleto);

    // Descobre o tipo MIME pela extensão
    const extensao = path.extname(caminhoRelativo).slice(1); // "jpg"
    const mimeType = `image/${extensao === 'jpg' ? 'jpeg' : extensao}`;

    // Converte o Buffer para string Base64
    const base64 = buffer.toString('base64');

    // Retorna no formato Data URL
    return `data:${mimeType};base64,${base64}`;
    // "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Anatomia de uma Data URL Base64:

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...
│    │          │       │
│    │          │       └── Dados da imagem codificados em Base64
│    │          └────────── Indica que é codificação Base64
│    └───────────────────── Tipo MIME do arquivo (image/jpeg, image/png, etc.)
└────────────────────────── Prefixo obrigatório para Data URLs
```

---

## 8 - Fluxo Completo Resumido

```
┌─────────────────────────────────────────────────────────────────┐
│                        UPLOAD (Salvando)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Usuário seleciona imagem no <input type="file">             │
│                         │                                       │
│  2. JavaScript cria FormData e faz fetch() com POST             │
│                         │                                       │
│  3. Express recebe a requisição                                 │
│                         │                                       │
│  4. Multer (middleware) intercepta:                              │
│     • Lê os dados binários do arquivo                           │
│     • Salva na pasta src/public/uploads/                        │
│     • Preenche req.file com informações do arquivo              │
│                         │                                       │
│  5. Controller recebe req.file e req.body:                      │
│     • Pega o caminho: "/uploads/" + req.file.filename           │
│     • Salva o CAMINHO (string) no banco MySQL                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXIBIÇÃO (Mostrando)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opção A — Caminho direto (mais comum):                         │
│     <img src="/uploads/1714588594000-foto.jpg">                 │
│     O express.static serve o arquivo automaticamente            │
│                                                                 │
│  Opção B — Base64 (preview antes de salvar):                    │
│     FileReader.readAsDataURL(arquivo) → string Base64           │
│     <img src="data:image/jpeg;base64,/9j/4AA...">              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura dos arquivos do projeto:

```
src/
├── middleware/
│   └── multerConfig.ts        ← Configuração do Multer (seção 3)
├── Routes/
│   └── admin/
│       └── productsRoute.ts   ← Rota com middleware (seção 4)
├── Controller/
│   └── admin/
│       └── ProductsController.ts  ← Recebe req.file (seção 5)
├── public/
│   ├── uploads/               ← Pasta onde as imagens são salvas
│   │   ├── 17145885-foto1.jpg
│   │   └── 17145886-foto2.png
│   └── admin/
│       └── products/
│           └── create.ts      ← Front-end com FormData (seção 6)
└── server.ts                  ← express.static + multer import
```

---

> 📝 **Resumo Final**: O Multer pega o arquivo binário da requisição, salva fisicamente na pasta `uploads/`, e coloca as informações em `req.file`. No banco de dados, salvamos apenas o **caminho** (string). Para exibir, usamos esse caminho no `<img src>` ou convertemos para Base64 quando precisamos de preview.
