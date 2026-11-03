# UniFit

Plataforma web de gerenciamento da academia da Universidade de Fortaleza (Unifor), desenvolvida para integrar alunos, monitores e administradores em um único ambiente.

O sistema permite o gerenciamento de acompanhamentos esportivos, agendamentos, fichas de treino e administração dos profissionais vinculados à academia.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React, Vite, Tailwind CSS, shadcn/ui |
| Back-end | Node.js, Express |
| Banco de dados | MySQL 8 |
| Autenticação | JWT, cookies httpOnly e bcrypt |
| Controle de acesso | RBAC (Role-Based Access Control) |

## Estrutura do projeto

```text
UniFit/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   └── ...
│
├── backend/
│   ├── sql/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── ...
│   └── ...
│
├── .gitignore
└── README.md
```

## Funcionalidades

O UniFit possui três papéis principais, cada um com permissões específicas.

### Aluno

- Cadastro, autenticação e gerenciamento da conta.
- Visualização dos próprios dados.
- Consulta dos monitores disponíveis por especialidade.
- Gerenciamento de vínculos com monitores.
- Consulta de horários disponíveis.
- Agendamento e cancelamento de consultas.
- Visualização dos próprios agendamentos.
- Consulta de fichas de treino.

### Monitor

- Acompanhamento dos alunos vinculados.
- Gerenciamento de fichas de treino.
- Organização de fichas por divisões (A–F).
- Inclusão, edição e ordenação de exercícios.
- Seleção dos dias da semana de cada divisão.
- Salvamento de fichas como rascunho ou publicação.

As funcionalidades disponíveis dependem da especialidade e das permissões atribuídas ao monitor.

### Administrador

- Gerenciamento de monitores.
- Cadastro, edição e desativação de monitores.
- Definição de especialidade e registro profissional.
- Gerenciamento de supervisores.
- Configuração de autorizações e permissões.
- Gerenciamento de vínculos entre alunos e monitores.
- Administração dos profissionais cadastrados.

## Módulos do sistema

### 1. Autenticação e autorização

O sistema utiliza JWT armazenado em cookie `httpOnly`, com senhas protegidas por bcrypt.

O controle de acesso é realizado no back-end por middlewares, considerando os papéis:

- `aluno`
- `monitor`
- `admin`

As rotas protegidas verificam a autenticação e as permissões necessárias antes de permitir o acesso.

### 2. Vínculos entre alunos e monitores

Os vínculos estabelecem a relação entre um aluno e o profissional responsável pelo seu acompanhamento.

Cada vínculo possui uma especialidade:

- Educação Física;
- Fisioterapia;
- Nutrição.

Um aluno pode possuir vínculos com diferentes profissionais, mantendo um monitor ativo por especialidade.

Esses vínculos são utilizados para controlar o acesso aos acompanhamentos e permitir que os agendamentos sejam associados ao profissional correto.

### 3. Agendamentos

O módulo de agendamentos utiliza os vínculos e a disponibilidade semanal dos monitores para determinar os horários que podem ser reservados.

Principais operações da API:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/agendamentos/horarios` | Consultar horários disponíveis |
| GET | `/api/agendamentos/meus` | Consultar agendamentos do aluno |
| POST | `/api/agendamentos` | Criar agendamento |
| DELETE | `/api/agendamentos/:id` | Cancelar agendamento |

### 4. Fichas de treino

O módulo permite a criação e organização de fichas de treino.

Principais recursos:

- Divisões de treino de A até F.
- Biblioteca de exercícios.
- Inclusão, edição e ordenação de exercícios.
- Configuração dos dias da semana de cada divisão.
- Salvamento como rascunho.
- Publicação de fichas.

### 5. Administração de monitores

O módulo administrativo permite gerenciar os profissionais cadastrados na plataforma.

Informações administráveis:

- Nome;
- CPF;
- E-mail;
- Especialidade;
- Registro profissional;
- Supervisor;
- Situação (ativo ou inativo);
- Tipo de autorização;
- Permissões individuais.

Principais rotas administrativas:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/monitores` | Listar monitores |
| POST | `/api/admin/monitores` | Cadastrar monitor |
| GET | `/api/admin/monitores/:id` | Consultar monitor |
| PUT | `/api/admin/monitores/:id` | Editar monitor |
| GET | `/api/admin/monitores/:id/historico` | Consultar histórico |
| PATCH | `/api/admin/monitores/:id/status` | Alterar situação |
| PUT | `/api/admin/monitores/:id/permissoes` | Atualizar permissões |
| PATCH | `/api/admin/monitores/:id/autorizacao` | Alterar autorização |

## Instalação e execução

### Pré-requisitos

- Node.js 20 ou superior.
- Git.
- MySQL 8.
- MySQL Workbench.

Verifique as instalações:

```bash
node -v
npm -v
git --version
```

### 1. Clonar o repositório

```bash
git clone https://github.com/RaffMlv/UniFit.git
cd UniFit
git checkout develop
```

### 2. Configurar o banco de dados

1. Abra o MySQL Workbench.
2. Conecte-se à instância local do MySQL.
3. Abra os arquivos da pasta `backend/sql/`.
4. Execute os scripts na ordem numérica.

No script inicial (`01_schema.sql`), substitua `sua_senha_aqui` pela senha que será utilizada pelo usuário `unifit`.

**Importante:** não envie alterações contendo senhas para o Git.

Após a execução, verifique se o banco foi criado:

```sql
SELECT * FROM academia_unifor.usuarios;
```

A consulta deve retornar vazia, sem erros, caso ainda não existam usuários cadastrados.

Sempre que novos scripts SQL forem adicionados ao projeto, execute-os na ordem correspondente.

### 3. Configurar o back-end

Entre na pasta:

```bash
cd backend
npm install
```

Crie o arquivo `.env` utilizando o modelo disponível:

**Windows:**

```bash
copy .env.example .env
```

**Mac/Linux:**

```bash
cp .env.example .env
```

Gere uma chave secreta para o JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Configure o arquivo `backend/.env`:

```env
PORT=3333

DB_HOST=localhost
DB_USER=unifit
DB_PASSWORD=sua_senha
DB_NAME=academia_unifor

JWT_SECRET=sua_chave_gerada

FRONTEND_URL=http://localhost:5173
```

Utilize a senha definida durante a configuração do banco e a chave JWT gerada anteriormente.

Inicie o servidor:

```bash
npm run dev
```

Para verificar se a API está funcionando, acesse:

http://localhost:3333/api/saude

Resultado esperado:

```json
{
  "status": "ok"
}
```

### 4. Configurar o front-end

Abra outro terminal e entre na pasta:

```bash
cd frontend
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

http://localhost:5173

### 5. Criar um administrador

Primeiramente, cadastre um usuário pela tela de cadastro ou pela rota:

```http
POST /api/auth/cadastro
```

Depois, abra o MySQL Workbench e execute:

```sql
UPDATE academia_unifor.usuarios
SET papel = 'admin'
WHERE email = 'seu-email@exemplo.com';
```

Para criar um monitor de teste, utilize:

```sql
UPDATE academia_unifor.usuarios
SET papel = 'monitor'
WHERE email = 'seu-email@exemplo.com';
```

## Fluxo de trabalho com Git

O desenvolvimento utiliza três níveis de branches:

| Branch | Finalidade |
|---|---|
| `main` | Versão estável do projeto |
| `develop` | Integração das funcionalidades |
| `feature/nome-da-tarefa` | Desenvolvimento de funcionalidades específicas |

### Iniciando uma tarefa

Sempre crie sua branch a partir da versão atualizada de `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/nome-da-tarefa
```

### Commits

Utilize prefixos padronizados:

| Prefixo | Utilização |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de erros |
| `chore:` | Manutenção e configurações |
| `docs:` | Documentação |

Exemplos:

```bash
git add .
git commit -m "feat: implementa agendamento de consultas"
git push -u origin feature/nome-da-tarefa
```

### Pull Requests

- Toda funcionalidade deve ser desenvolvida em uma branch própria.
- O código deve ser enviado para a `develop` por meio de Pull Request.
- Todo Pull Request deve ser revisado por outro integrante da equipe.
- A branch `main` recebe apenas versões estáveis, após revisão e integração.

**Atenção:** antes de executar `git add .`, confira o resultado de:

```bash
git status
```

Verifique se arquivos `.env`, `node_modules` e outros arquivos locais não estão sendo adicionados ao commit.

## Banco de dados e versionamento

Alterações na estrutura do banco devem ser documentadas e compartilhadas com a equipe.

- Não altere apenas o banco local.
- Adicione um novo script SQL na pasta `backend/sql/`.
- Utilize numeração sequencial.
- Descreva brevemente a finalidade da alteração.
- Execute os scripts na ordem indicada.

Dessa forma, todos os integrantes conseguem manter seus bancos de dados sincronizados.

## Problemas comuns

| Problema | Solução |
|---|---|
| `bcrypt` não instala no Windows | Utilize `bcryptjs` e atualize o import correspondente. |
| Erro de autenticação MySQL (`caching_sha2_password`) | Confira se o `.env` utiliza o usuário `unifit`, em vez de `root`. |
| Porta 3306 ocupada | Verifique se outro serviço MySQL está utilizando a porta. |
| Porta 5173 ocupada | Encerre o processo responsável ou altere a porta do Vite. |
| Porta 3333 ocupada | Encerre o processo responsável ou altere a porta da API. |
| Erro de autenticação na aplicação | Verifique o JWT, o cookie e as configurações de conexão. |
| Tabelas inexistentes | Confira se todos os scripts SQL foram executados na ordem correta. |

## Contribuição

O UniFit é desenvolvido colaborativamente, com foco na organização do código, integração entre front-end e back-end e manutenção da consistência dos dados.

Antes de implementar uma funcionalidade, verifique a estrutura existente e os módulos relacionados para evitar duplicação de código e incompatibilidades.

**Repositório:** https://github.com/RaffMlv/UniFit
