# Brain Agriculture API

API para gerenciamento de produtores rurais, fazendas e culturas por safra, desenvolvida com NestJS, Prisma e PostgreSQL.

## Stack

- Node.js LTS
- TypeScript
- NestJS
- PostgreSQL
- Prisma
- class-validator e class-transformer
- Swagger/OpenAPI
- Jest
- Docker e Docker Compose

## 1. Instalação de dependências

```bash
npm install
```

## 2. Configuração do ambiente (.env)

Crie o arquivo `.env` com base em `.env.example`.

Variáveis obrigatórias:

```dotenv
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
AUTH_USERNAME=
AUTH_PASSWORD_HASH=
CORS_ORIGIN=
```

Exemplo de `DATABASE_URL` local:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brain_agriculture?schema=public"
```

`CORS_ORIGIN` aceita uma ou mais origens separadas por vírgula.

Exemplo:

```dotenv
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

Quando `CORS_ORIGIN` estiver vazio em desenvolvimento, a API permite origens localhost/127.0.0.1 para facilitar testes locais.

## 3. Gerar AUTH_PASSWORD_HASH

Não armazene senha em texto puro.

Use o comando abaixo para gerar um hash bcrypt:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('sua_senha_forte', 10));"
```

Copie o hash gerado para `AUTH_PASSWORD_HASH` no `.env`.

## 4. Subir PostgreSQL com Docker

```bash
docker compose up -d
```

## 5. Executar migrations

```bash
npx prisma migrate dev --name init
```

Se necessário, gere novamente o client:

```bash
npx prisma generate
```

## 6. Iniciar a API

```bash
npm run start:dev
```

## 7. Acessar Swagger

```text
http://localhost:3000/api
```

## 8. Login

Endpoint público:

`POST /auth/login`

Body:

```json
{
    "username": "seu_usuario",
    "password": "sua_senha"
}
```

Resposta:

```json
{
    "access_token": "<jwt>",
    "token_type": "Bearer",
    "expires_in": "1h"
}
```

## 9. Usar JWT nas rotas protegidas

Todas as rotas são privadas por padrão.

Envie o token no header:

```text
Authorization: Bearer <access_token>
```

Exemplo:

`GET /producers`

## 10. Endpoints públicos

- `POST /auth/login`

## 11. Endpoints que exigem autenticação

- `GET /health`
- `GET /dashboard`
- Todas as rotas em `/producers` e sub-rotas
- Demais rotas não marcadas com `@Public()`

## Segurança implementada

- JWT com `@nestjs/jwt` e `passport-jwt`
- Guard JWT global (rotas privadas por padrão)
- Decorator `@Public()` para rotas públicas
- Rate limiting com `@nestjs/throttler`
- Headers HTTP de segurança com `helmet`
- CORS configurável via variável de ambiente

## Comandos úteis

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```
