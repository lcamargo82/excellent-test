# Ambiente de Desenvolvimento - NestJS + Angular + PostgreSQL

Este repositório contém a estrutura completa para um ambiente de desenvolvimento full-stack utilizando Docker.
Os projetos NestJS (backend) e Angular (frontend) já foram inicializados.

## Pré-requisitos

- Docker
- Docker Compose

## Gerenciamento dos Containers

### Iniciar o ambiente

```bash
docker-compose up -d
```

### Parar o ambiente

```bash
docker-compose down
```

## Executando os Projetos

Atualmente, os containers estão configurados para rodar em modo de espera (`tail -f /dev/null`). Você precisa iniciar os servidores de desenvolvimento manualmente.

### Backend (NestJS)

Para iniciar o servidor de desenvolvimento do backend:

```bash
docker exec -it nestjs_backend npm run start:dev
```

O servidor estará acessível em: `http://localhost:3000`

### Frontend (Angular)

Para iniciar o servidor de desenvolvimento do frontend:

```bash
docker exec -it angular_frontend ng serve --host 0.0.0.0
```

O servidor estará acessível em: `http://localhost:4200`

### Tornar a execução automática

Para que os projetos iniciem automaticamente com `docker-compose up`, altere o arquivo `docker-compose.yml`:

**Backend:**
Altere `command: tail -f /dev/null` para `command: npm run start:dev`

**Frontend:**
Altere `command: tail -f /dev/null` para `command: ng serve --host 0.0.0.0`

## Banco de Dados (PostgreSQL)

O banco de dados PostgreSQL está acessível na porta `5432`.

- **Host**: localhost (do seu computador) ou `postgres` (de dentro dos containers)
- **User**: admin
- **Password**: admin
- **Database**: excellent_db

As credenciais estão definidas no arquivo `.env`.
