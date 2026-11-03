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