# 📦 Projeto Ainda-Sem-Nome

Este é um projeto fullstack simples utilizando apenas Node.js, dividido em dois arquivos principais: `server.js` (backend) e `app.js` (frontend). O projeto também utiliza migrations para gerenciar o banco de dados.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [Node.js](https://nodejs.org/) instalado (recomendado: versão 18 ou superior)
- Um banco de dados configurado (como PostgreSQL, MySQL, SQLite, etc.)

---

## ⚙️ Passo a passo para rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Inteli-College/2025-1B-T15-IN02-G04.git
cd app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (exemplo):

```
DB_USER=postgres.bglrbhiltzliaunpqcfu
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_DATABASE=postgres
DB_PASSWORD=gRup0-4-o-m3lh0r@@
DB_PORT=5432
DB_SSL=True
```

---

### 4. Rode as migrations do banco de dados

```bash
npm run migrate:dev
```

---

### 5. Inicie o backend (API)

```bash
node server.js
```

---

### 6. Inicie o frontend

Em outro terminal:

```bash
node app.js
```

---

## 📄 Licença

No hay