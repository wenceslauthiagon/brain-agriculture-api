# Brain Agriculture API

API para gerenciamento de produtores rurais, fazendas e culturas por safra, desenvolvida com NestJS, Prisma e PostgreSQL.

## Objetivo

A aplicação foi estruturada para atender ao teste técnico da Brain Agriculture, com foco em:

- cadastro de produtores
- cadastro de fazendas
- registro de culturas por safra
- validacao de regras de negocio
- estrutura modular para evolucao
- possibilidade de uso com Docker + PostgreSQL

## Stack utilizada

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma
- Docker e Docker Compose
- Jest
- Swagger
- class-validator / class-transformer

## Estrutura do projeto

```text
src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── main.ts
├── common/
├── config/
└── modules/
    ├── producers/
    └── dashboard/

prisma/
├── schema.prisma
└── migrations/

docker-compose.yml
.env
```

## Requisitos para rodar

Antes de iniciar, tenha instalado:

- Node.js LTS
- npm
- Docker
- Docker Compose

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variaveis:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=271364
POSTGRES_DB=brain_agriculture
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/brain_agriculture?schema=public"
```

> O arquivo `.env` pode ser renomeado depois para `.env.develop`, desde que a mesma estrutura seja mantida.

## Banco de dados com Docker

Na raiz do projeto, suba o banco com:

```bash
docker compose up -d
```

Se quiser usar outro arquivo de ambiente:

```bash
docker compose --env-file .env.develop up -d
```

## Instalar dependencias

```bash
npm install
```

## Rodar as migracoes do Prisma

```bash
npx prisma migrate dev --name init
```

Se necessario, gere o client:

```bash
npx prisma generate
```

## Iniciar a aplicacao

Modo desenvolvimento:

```bash
npm run start:dev
```

Ou em modo normal:

```bash
npm run start
```

## Validações e regras principais

A API deve cobrir, no minimo:

- cadastro de produtores
- cadastro de fazendas
- associacao de culturas por safra
- validacao de documento
- validacao da regra da area total x area agriculturavel x area de vegetacao
- endpoint para dashboard/indicadores

## Comandos uteis

```bash
# formatar schema Prisma
npx prisma format

# verificar schema
npx prisma validate

# abrir Prisma Studio
npx prisma studio

# build da aplicacao
npm run build

# rodar testes
npm run test

# testes E2E
npm run test:e2e
```

## Swagger

A aplicacao deve expor a documentacao OpenAPI em:

```text
http://localhost:3000/api
```

## Observacao final

Este README é um guia rápido de execução local. Seu foco é garantir uma configuração simples do ambiente para que você possa subir o banco, iniciar a API e testar a aplicação facilmente.
