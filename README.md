# Arquitetura Hexagonal - Comparação de Performance

Este repositório contém dois projetos que demonstram a implementação da arquitetura hexagonal (Ports and Adapters) em JavaScript:

1. **Serviço de Links Encurtados (hexagonal)**: Um serviço para encurtar URLs e redirecionar usuários.
2. **Serviço de Analytics (analytics)**: Um serviço dedicado para rastrear e analisar visitas aos links encurtados.

## Arquitetura

Os dois serviços seguem a arquitetura hexagonal, que separa o domínio da aplicação das suas dependências externas:

- **Domain**: Contém as entidades, regras de negócio e interfaces de repositórios
- **Application**: Contém os casos de uso e DTOs
- **Adapters**: Contém as implementações concretas para interfaces externas (web, banco de dados, serviços externos)

### Comunicação entre Serviços

Os serviços se comunicam através de interfaces bem definidas (ports) e adaptadores:

- O serviço de Links usa um `AnalyticsServiceAdapter` para enviar dados de visitas ao serviço de Analytics
- O serviço de Analytics usa um `LinkServiceAdapter` para verificar a existência de links no serviço de Links

Esta abordagem permite que cada serviço evolua independentemente, desde que mantenha a compatibilidade com as interfaces definidas.

## Pré-requisitos

- Node.js 18+
- PostgreSQL

## Configuração

### Serviço de Links

1. Entre na pasta `hexagonal`
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente copiando `.env.example` para `.env` e ajustando conforme necessário
4. Gere os arquivos do Prisma: `npm run prisma:generate`
5. Execute as migrações: `npm run prisma:migrate`

### Serviço de Analytics

1. Entre na pasta `analytics`
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente copiando `.env.example` para `.env` e ajustando conforme necessário
4. Gere os arquivos do Prisma: `npm run prisma:generate`
5. Execute as migrações: `npm run prisma:migrate`

## Executando os Serviços

### Serviço de Links

```
cd hexagonal
npm run dev
```

O serviço estará disponível em http://localhost:3000

### Serviço de Analytics

```
cd analytics
npm run dev
```

O serviço estará disponível em http://localhost:3001

## Fluxo de Dados

1. Um usuário acessa um link encurtado (ex: http://localhost:3000/abc123)
2. O serviço de Links redireciona o usuário para a URL original
3. O serviço de Links envia dados da visita para o serviço de Analytics
4. O serviço de Analytics processa e armazena os dados
5. Quando alguém consulta as estatísticas de um link, o serviço de Links solicita os dados ao serviço de Analytics

## Benefícios desta Arquitetura

1. **Separação de Responsabilidades**: Cada serviço tem uma responsabilidade clara
2. **Escalabilidade**: Os serviços podem ser escalados independentemente
3. **Manutenção**: Mudanças em um serviço não afetam o outro, desde que as interfaces sejam mantidas
4. **Testabilidade**: Cada componente pode ser testado isoladamente
