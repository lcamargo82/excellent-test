# Ambiente de Desenvolvimento - NestJS + Angular + PostgreSQL

Este repositório contém a estrutura completa para um ambiente de desenvolvimento full-stack utilizando Docker.
Os projetos NestJS (backend) e Angular (frontend) já foram inicializados.

## Pré-requisitos

- Docker
- Docker Compose

## Configuração Inicial

Após clonar o repositório, configure as variáveis de ambiente copiando o arquivo de exemplo:

```bash
cp example.env .env
```

## Instalação das Dependências

Para instalar as dependências de ambos os projetos (Backend e Frontend), execute os seguintes comandos na raiz de cada projeto:

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

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

## Documentação da API (Swagger)

A documentação interativa da API está disponível via Swagger UI.

Para acessar, certifique-se de que o servidor backend está rodando e acesse:

`http://localhost:3000/api`

Nesta interface, você pode testar todos os endpoints, ver os schemas de dados e autenticar (botão **Authorize**) usando o token JWT obtido no login.

## Banco de Dados (PostgreSQL)

O banco de dados PostgreSQL está acessível na porta `5432`.

- **Host**: localhost (do seu computador) ou `postgres` (de dentro dos containers)
- **User**: admin
- **Password**: admin
- **Database**: excellent_db

As credenciais estão definidas no arquivo `.env`.

## Testes Automatizados

O projeto inclui uma suíte de testes unitários robusta cobrindo os principais módulos e utilitários.

### Executar Testes Unitários

Para rodar todos os testes:

```bash
docker exec -it nestjs_backend npm run test
```

### Verificar Cobertura de Testes

Para gerar o relatório de cobertura (que deve estar acima de 80%):

```bash
docker exec -it nestjs_backend npm run test:cov
```

O relatório detalhado pode ser visualizado abrindo `backend/coverage/lcov-report/index.html` no navegador.

## Observabilidade (OpenTelemetry & Datadog)

Este projeto está integrado com OpenTelemetry para rastreamento distribuído (Tracing). Os traces são exportados via protocolo OTLP.

### Integração com Datadog

Para visualizar os traces no Datadog, configure as variáveis de ambiente no `docker-compose.yml` ou no `.env` usado pelo container backend.

**Opção 1: Via Datadog Agent (Recomendado)**
Se você tem um Datadog Agent rodando na rede (ex: `localhost:4318`):

```env
OTEL_SERVICE_NAME=excellent-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://host.docker.internal:4318
```

**Opção 2: Envio Direto (Serverless / Dev)**
Para enviar diretamente para a API do Datadog (site US):

```env
OTEL_SERVICE_NAME=excellent-backend
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.datadoghq.com
OTEL_EXPORTER_OTLP_HEADERS=DD-API-KEY=<SUA_API_KEY>
```

Após configurar e reiniciar o backend, as requisições HTTP serão rastreadas e aparecerão no painel **APM > Traces** do Datadog.

