# 📚 Guia Completo: Middlewares no Express

## O que é um Middleware?

Imagine uma **linha de montagem em uma fábrica**. Cada estação (middleware) recebe o produto (requisição), faz algo com ele (verifica, modifica, rejeita) e decide se passa para a próxima estação ou se devolve o produto.

No Express, um middleware é qualquer função que recebe três parâmetros:

```typescript
(req: Request, res: Response, next: NextFunction) => { ... }
```

| Parâmetro | O que é | Analogia |
|-----------|---------|----------|
| `req` | O pedido do cliente (dados, cookies, headers) | A encomenda chegando na fábrica |
| `res` | A resposta que será enviada de volta | O produto finalizado saindo da fábrica |
| `next` | A função que passa o controle para o próximo middleware | O botão "avançar" na esteira |

> **Regra de ouro:** Se um middleware não chama `next()` e não envia uma resposta (`res.send`, `res.redirect`, etc), a requisição fica **presa para sempre** (o navegador fica carregando infinitamente).

---

## Como os middlewares rodam no SEU projeto

A **ordem** em que você registra os middlewares no `server.ts` define a ordem de execução. Veja o fluxo real da sua aplicação:

```
Requisição do navegador
        │
        ▼
┌──────────────────────────┐
│  express.json()          │  ← Converte o body de JSON para objeto JS
│  express.urlencoded()    │  ← Converte dados de formulário HTML
│  express.static()        │  ← Serve arquivos estáticos (CSS, JS, imagens)
│  cookieParser()          │  ← Lê os cookies e coloca em req.cookies
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  /user (userRoute)       │  ← Login e Registro (SEM autenticação)
│  GET  /user/login        │
│  POST /user/login        │
│  GET  /user/register     │
│  POST /user/register     │
└──────────┬───────────────┘
           │ (se a rota NÃO começou com /user, continua descendo)
           ▼
┌──────────────────────────┐
│  🔒 authMiddleware       │  ← BARREIRA: verifica se está logado
│  verifyUserLogIn()       │
└──────────┬───────────────┘
           │ (só passa se tiver cookie válido)
           ▼
┌──────────────────────────┐
│  / (homeRoute)           │  ← Página inicial (protegida)
│  /admin/products         │  ← CRUD de produtos (protegido)
│    └─ multer (upload)    │  ← Middleware de upload nas rotas POST
└──────────────────────────┘
```

### Por que a ordem importa?

Observe que `app.use('/user', userRoute)` vem **ANTES** de `app.use(auth.verifyUserLogIn)`. Isso é proposital! Se a autenticação viesse primeiro, o usuário nunca conseguiria acessar a página de login — ele seria redirecionado para o login infinitamente (um loop).

```typescript
// server.ts — Ordem atual (CORRETA)
app.use('/user', userRoute);          // 1° — rotas públicas
let auth = new AuthMiddleware();
app.use(auth.verifyUserLogIn);        // 2° — barreira de autenticação
app.use('/', homeRoute);              // 3° — rotas protegidas
app.use('/admin/products', productsRoute); // 4° — rotas protegidas
```

---

## 1. 🔒 Middleware de Autenticação (`authMiddleware.ts`)

### Análise linha por linha

```typescript
import { Request, Response, NextFunction } from "express";
import UserModel from "../Model/user/userModel";

class AuthMiddleware {
    public async verifyUserLogIn(req: Request, res: Response, next: NextFunction) {

        // PASSO 1: Verifica se o cookie existe
        if (req.cookies != undefined && req.cookies.usuarioLogado) {
            const userId = req.cookies.usuarioLogado;

            // PASSO 2: Cria uma instância "vazia" do UserModel só para chamar GetUser
            const user = new UserModel(0, '', '', '', '');

            // PASSO 3: Consulta o banco para verificar se o ID é real
            let result = await user.GetUser(userId);

            if (result) {
                // PASSO 4a: Usuário existe → libera o acesso
                next();
            } else {
                // PASSO 4b: ID não encontrado → redireciona para login
                res.redirect('/user/login');
            }
        } else {
            // PASSO 1b: Sem cookie → redireciona para login
            res.redirect('/user/login');
        }
    }
}
```

### Problemas encontrados e como resolver

#### ❌ Problema 1: Senha armazenada em texto puro no banco

Olhando o seu `userModel.ts`, a senha é salva diretamente no banco de dados:

```typescript
// userModel.ts — Login atual
const sql = 'select * from tb_user where ... and tb_user_password = ?';
const values = [name, email, password]; // ← senha em texto puro!
```

Se alguém acessar seu banco de dados (vazamento, SQL injection, etc.), todas as senhas dos usuários ficam expostas.

**✅ Solução: Usar `bcrypt` para hash de senha**

O `bcrypt` transforma a senha em um hash irreversível. Mesmo que o banco vaze, ninguém consegue ler a senha original.

```typescript
import bcrypt from 'bcrypt';

// No REGISTRO — transforma a senha antes de salvar
const saltRounds = 10;
const senhaHash = await bcrypt.hash(this.password, saltRounds);
// Salva "senhaHash" no banco, NÃO a senha original

// No LOGIN — compara a senha digitada com o hash salvo
const match = await bcrypt.compare(senhaDigitada, senhaDoBanco);
if (match) {
    // login OK
}
```

#### ❌ Problema 2: Cookie manipulável (Segurança Crítica)

No `userController.ts`, após o login bem-sucedido, o ID do usuário é salvo direto no cookie:

```typescript
res.cookie('usuarioLogado', result); // result = tb_user_id (ex: 1, 2, 3...)
```

Qualquer pessoa pode abrir o DevTools do navegador (F12 → Application → Cookies), mudar o valor de `1` para `2`, e acessar a conta de outro usuário. Isso é uma falha grave chamada **Cookie Forgery**.

**✅ Solução: Usar JWT (JSON Web Token)**

O JWT funciona como um **documento de identidade assinado digitalmente**. O servidor cria o token com uma chave secreta que só ele conhece. Se o usuário tentar modificar o conteúdo do token, a assinatura fica inválida e o servidor rejeita.

```
┌─────────────────────────────────────────────────┐
│                  TOKEN JWT                      │
├───────────┬─────────────────┬───────────────────┤
│  HEADER   │    PAYLOAD      │    ASSINATURA     │
│  (tipo)   │  (dados)        │  (verificação)    │
│           │  id: 5          │  HMAC-SHA256(     │
│           │  nome: "Gui"    │    header+payload │
│           │  exp: 1h        │    + CHAVE_SECRETA│
│           │                 │  )                │
└───────────┴─────────────────┴───────────────────┘
```

Exemplo de implementação:

```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// --- No Controller (Login) ---
// Após validar o usuário no banco:
const token = jwt.sign(
    { id: user.id, nome: user.name },  // dados que ficam dentro do token
    SECRET,
    { expiresIn: '2h' }               // token expira em 2 horas
);
res.cookie('token', token, { httpOnly: true }); // httpOnly impede acesso via JS

// --- No Middleware (Autenticação) ---
class AuthMiddleware {
    public async verifyUserLogIn(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.redirect('/user/login');
            }
            const decoded = jwt.verify(token, SECRET); // verifica + decodifica
            req.body.userId = (decoded as any).id;      // disponibiliza o ID para as rotas
            next();
        } catch (error) {
            // Token inválido, expirado ou adulterado
            res.redirect('/user/login');
        }
    }
}
```

**Vantagens do JWT sobre o cookie simples:**
| Cookie simples | JWT |
|---|---|
| Qualquer um pode alterar | Adulteração invalida o token |
| Consulta o banco em cada requisição | Dados já estão no token (mais rápido) |
| Nunca expira | Expira automaticamente (`expiresIn`) |
| Sem proteção contra XSS | `httpOnly: true` bloqueia acesso via JavaScript |

#### ❌ Problema 3: Sem tratamento de erros

Se o banco cair, a linha `await user.GetUser(userId)` lança uma exceção não tratada e **derruba o servidor inteiro**.

**✅ Solução: Envolver em try/catch**

```typescript
public async verifyUserLogIn(req: Request, res: Response, next: NextFunction) {
    try {
        // ... toda a lógica de verificação aqui ...
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).send('Erro interno do servidor');
    }
}
```

#### ❌ Problema 4: Instanciação desnecessária do Model

```typescript
const user = new UserModel(0, '', '', '', ''); // parâmetros inúteis
let result = await user.GetUser(userId);
```

Você cria um objeto inteiro com dados falsos só para chamar um método. Isso indica que `GetUser` deveria ser um método **estático** (que pertence à classe, não ao objeto):

```typescript
// userModel.ts
public static async GetUser(id: number) {
    const sql = 'select * from tb_user where tb_user_id = ?';
    const database = new Database();
    return await database.ExecutaComando(sql, [id]);
}

// authMiddleware.ts — uso simplificado
let result = await UserModel.GetUser(userId);
```

---

## 2. 📁 Middleware de Upload (`multerconfig.ts`)

### Como o Multer funciona internamente

O Multer é um middleware que intercepta requisições do tipo `multipart/form-data` (formulários com upload de arquivo). Ele faz o trabalho pesado de:

1. **Receber** os bytes do arquivo que chegam pela rede
2. **Decidir onde salvar** (memória ou disco)
3. **Nomear** o arquivo
4. **Disponibilizar** as informações em `req.file` (para `.single()`) ou `req.files` (para `.array()`)

```
Navegador envia o formulário com imagem
        │
        ▼
┌───────────────────────────────────┐
│         MULTER MIDDLEWARE         │
│                                   │
│  1. Lê os bytes do arquivo        │
│  2. Chama destination() → pasta   │
│  3. Chama filename() → nome       │
│  4. Salva no disco                │
│  5. Popula req.file com:          │
│     - originalname                │
│     - filename (novo nome)        │
│     - path (caminho completo)     │
│     - size (tamanho em bytes)     │
│     - mimetype (tipo do arquivo)  │
└───────────────┬───────────────────┘
                │
                ▼
        Controller recebe req.file
```

### Análise linha por linha

```typescript
import multer from 'multer';
import path from 'path'; // importado mas NÃO utilizado (problema!)

const storage = multer.diskStorage({
    // Onde salvar o arquivo
    destination: (req, file, cb) => {
        cb(null, 'src/public/img');  // caminho relativo (pode quebrar)
    },
    // Como nomear o arquivo
    filename: (req, file, cb) => {
        const nameFile = Date.now().toString() + '_' + file.originalname;
        cb(null, nameFile);          // Ex: "1714934400000_foto.png"
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
    // ⚠️ FALTA fileFilter — aceita QUALQUER tipo de arquivo!
});
```

> **Nota sobre o `cb` (callback):** O `cb` segue o padrão Node.js: o primeiro argumento é o erro (ou `null` se não houver erro), e o segundo é o valor de sucesso. Exemplo: `cb(null, 'src/public/img')` significa "sem erro, salve aqui".

### Problemas encontrados e como resolver

#### ❌ Problema 1: Sem filtro de tipo de arquivo (Vulnerabilidade Grave)

Sem o `fileFilter`, alguém pode enviar qualquer arquivo: `.exe`, `.sh`, `.php`, `.js`. Se um atacante enviar um script malicioso e conseguir executá-lo, ele pode tomar controle do servidor.

**✅ Solução: Adicionar `fileFilter` com validação dupla**

Validar apenas o `mimetype` não é suficiente — ele pode ser falsificado pelo cliente. O ideal é validar **também** a extensão do arquivo:

```typescript
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Lista de tipos MIME permitidos
        const mimePermitidos = ['image/png', 'image/jpeg', 'image/webp'];

        // Lista de extensões permitidas
        const extensoesPermitidas = ['.png', '.jpg', '.jpeg', '.webp'];
        const extensao = path.extname(file.originalname).toLowerCase();

        if (mimePermitidos.includes(file.mimetype) && extensoesPermitidas.includes(extensao)) {
            cb(null, true);  // arquivo aceito
        } else {
            cb(new Error('Apenas imagens PNG, JPG e WebP são permitidas.'));
        }
    }
});
```

#### ❌ Problema 2: Caminho relativo pode quebrar

```typescript
cb(null, 'src/public/img'); // ← depende de ONDE você executa o comando
```

Se você rodar `npm start` de uma pasta diferente da raiz do projeto, o Node não vai encontrar `src/public/img` e vai lançar um erro.

**✅ Solução: Usar `path.resolve` ou `path.join` com `__dirname`**

```typescript
destination: (req, file, cb) => {
    // __dirname = pasta onde ESTE arquivo está (middleware/)
    // Subindo um nível (..) e entrando em public/img
    cb(null, path.join(__dirname, '../public/img'));
}
```

> `path.join` junta os caminhos de forma segura, tratando barras `/` e `\` automaticamente entre sistemas operacionais.

#### ❌ Problema 3: Nome do arquivo com caracteres especiais

Se o usuário enviar um arquivo chamado `foto da promoção (1).png`, a URL gerada ficaria:

```
/img/1714934400000_foto da promoção (1).png
```

Espaços e caracteres especiais em URLs causam problemas. 

**✅ Solução: Gerar um nome único com `crypto`**

```typescript
import crypto from 'crypto';

filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    const extensao = path.extname(file.originalname); // .png, .jpg, etc
    cb(null, `${hash}${extensao}`);
    // Resultado: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.png"
}
```

#### ❌ Problema 4: Módulo `path` importado mas não utilizado

Na linha 2 do arquivo atual, `path` é importado mas nunca usado. Após aplicar as melhorias acima, ele passa a ser necessário. Até lá, é um *import* morto.

---

## 3. Versão final melhorada dos middlewares

### `authMiddleware.ts` (com JWT)

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'troque_por_uma_chave_segura';

class AuthMiddleware {
    public async verifyUserLogIn(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.token;

            if (!token) {
                return res.redirect('/user/login');
            }

            const decoded = jwt.verify(token, SECRET);
            // Disponibiliza os dados do usuário para os controllers
            (req as any).usuario = decoded;
            next();

        } catch (error) {
            console.error('Token inválido ou expirado:', error);
            res.clearCookie('token');
            res.redirect('/user/login');
        }
    }
}

export default AuthMiddleware;
```

### `multerconfig.ts` (com filtros e segurança)

```typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        const hash = crypto.randomBytes(16).toString('hex');
        const extensao = path.extname(file.originalname).toLowerCase();
        cb(null, `${hash}${extensao}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const mimePermitidos = ['image/png', 'image/jpeg', 'image/webp'];
        const extensoesPermitidas = ['.png', '.jpg', '.jpeg', '.webp'];
        const extensao = path.extname(file.originalname).toLowerCase();

        if (mimePermitidos.includes(file.mimetype) && extensoesPermitidas.includes(extensao)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens PNG, JPG e WebP são permitidas.'));
        }
    }
});

export default upload;
```

---

## 4. Checklist de melhorias

| # | Melhoria | Prioridade | Arquivo |
|---|----------|------------|---------|
| 1 | Hash de senhas com `bcrypt` | 🔴 Crítica | `userModel.ts`, `userController.ts` |
| 2 | Trocar cookie simples por JWT | 🔴 Crítica | `authMiddleware.ts`, `userController.ts` |
| 3 | Adicionar `fileFilter` no Multer | 🔴 Crítica | `multerconfig.ts` |
| 4 | Try/catch no middleware de auth | 🟡 Alta | `authMiddleware.ts` |
| 5 | Usar `path.join` com `__dirname` | 🟡 Alta | `multerconfig.ts` |
| 6 | Sanitizar nome de arquivo | 🟢 Média | `multerconfig.ts` |
| 7 | Tornar `GetUser` estático | 🟢 Média | `userModel.ts` |

---

## 5. Bibliotecas necessárias para as melhorias

```bash
# JWT para autenticação segura
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# Bcrypt para hash de senhas
npm install bcrypt
npm install -D @types/bcrypt
```
