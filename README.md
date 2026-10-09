# UniFit

Plataforma web da academia da Unifor.

## Stack

- **Front-end:** React + Vite, Tailwind CSS e shadcn/ui
- **Back-end:** Node.js + Express
- **Banco de dados:** MySQL
- **Autenticação:** JWT em cookie httpOnly + bcrypt
- **Controle de acesso (RBAC):** middleware no servidor, com os papéis `aluno`, `monitor` e `admin`

## Estrutura

```
UniFit/
├── frontend/          # React + Vite
├── backend/
│   ├── sql/           # scripts do banco, executar em ordem numérica
│   └── src/           # código da API (config, middlewares, routes)
├── .gitignore
└── README.md
```

## Pré-requisitos

- Node.js 20 ou superior (`node -v`)
- Git (`git --version`)
- MySQL 8 e MySQL Workbench

## Como rodar

### 1. Clonar e abrir

```bash
git clone https://github.com/SEU-USUARIO/UniFit.git
cd UniFit
git checkout develop
code .
```

### 2. Configurar o banco de dados

1. Abra o MySQL Workbench e conecte na instância local (usuário `root`).
2. Abra o arquivo `backend/sql/01_schema.sql`.
3. Troque `sua_senha_aqui` por uma senha de sua escolha para o usuário `unifit`.
   **Não faça commit dessa alteração.**
4. Execute o script inteiro (`Ctrl + Shift + Enter`).
5. Confira com: `SELECT * FROM academia_unifor.usuarios;` (deve retornar vazio, sem erro).

Quando houver novos scripts em `backend/sql/` (`02_...`, `03_...`), execute-os em ordem.

### 3. Configurar o back-end

```bash
cd backend
npm install
```

Crie o arquivo `.env` a partir do modelo:

```bash
# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Gere uma chave secreta para o JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Edite o `backend/.env`, preenchendo a chave gerada e a senha do usuário `unifit` do passo anterior:

```
PORT=3333
DB_HOST=localhost
DB_USER=unifit
DB_PASSWORD=a_senha_que_voce_definiu
DB_NAME=academia_unifor
JWT_SECRET=a_chave_gerada_acima
FRONTEND_URL=http://localhost:5173
```

> O `.env` nunca deve ser enviado ao Git. Cada pessoa usa a própria chave e a própria senha de banco.

Inicie a API:

```bash
npm run dev
```

Teste em `http://localhost:3333/api/saude`. O resultado esperado é `{"status":"ok"}`.

### 4. Configurar o front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### 5. Criar um usuário administrador

1. Cadastre um usuário pela tela de cadastro (ou por `POST /api/auth/register`).
2. No Workbench, promova-o:

```sql
UPDATE academia_unifor.usuarios SET papel = 'admin' WHERE email = 'seu-email@exemplo.com';
```

Use `'monitor'` no lugar de `'admin'` para criar um monitor de teste.

## Fluxo de trabalho com Git

| Branch | Uso |
|---|---|
| `main` | Versão estável, só recebe merge por Pull Request |
| `develop` | Integração do trabalho da equipe |
| `feature/nome-da-tarefa` | Uma branch por tarefa, criada a partir da `develop` |

```bash
git checkout develop
git pull
git checkout -b feature/nome-da-tarefa
```

- Todo merge na `develop` passa por Pull Request revisado por outra pessoa.
- Prefixos de commit: `feat:`, `fix:`, `chore:`, `docs:`.
- Antes de cada `git add .`, confira com `git status` que `.env` e `node_modules` não aparecem.
- Mudanças no banco entram como **novo arquivo** em `backend/sql/`, nunca só na máquina de quem fez.

## Problemas comuns

| Problema | Solução |
|---|---|
| `bcrypt` não instala no Windows | `npm uninstall bcrypt`, depois `npm install bcryptjs` e troque o import em `auth.routes.js` |
| Erro de autenticação do MySQL (`caching_sha2_password`) | Use o usuário `unifit` criado no script, e não o `root`, no `.env` |
| Porta 3306 ocupada | Verifique se há outro serviço MySQL ativo nos Serviços do Windows |
| Porta 5173 ou 3333 ocupada | Encerre o processo que a usa ou altere a porta no `.env` |