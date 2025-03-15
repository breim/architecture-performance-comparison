# Analytics Service

Este é um serviço de analytics que utiliza a arquitetura hexagonal para registrar e consultar dados de analytics para links encurtados.

## Arquitetura

O projeto segue a arquitetura hexagonal (também conhecida como Ports and Adapters), que separa o domínio da aplicação das suas dependências externas:

- **Domain**: Contém as entidades, regras de negócio e interfaces de repositórios
- **Application**: Contém os casos de uso e DTOs
- **Adapters**: Contém as implementações concretas para interfaces externas (web, banco de dados, serviços externos)

## Pré-requisitos

- Node.js 18+
- PostgreSQL

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e ajustando conforme necessário
4. Gere os arquivos do Prisma:
   ```
   npm run prisma:generate
   ```
5. Execute as migrações do banco de dados:
   ```
   npm run prisma:migrate
   ```

## Executando o projeto

Para desenvolvimento:
```
npm run dev
```

Para produção:
```
npm start
```

## Endpoints da API

### Criar um registro de analytics
```
POST /api/analytics
```
Corpo da requisição:
```json
{
  "linkId": "id-do-link"
}
```

### Obter analytics de um link
```
GET /api/analytics/:linkId?page=1&limit=10
```

## Integração com o serviço de links

Este serviço se comunica com o serviço de links através da interface `LinkServicePort` e sua implementação `LinkServiceAdapter`. A comunicação é feita via HTTP REST.

## Testes

Para executar os testes:
```
npm test
```

Para executar os testes em modo de observação:
```
npm run test:watch
```