# Arquitetura do Sistema

Este documento descreve a arquitetura do sistema composto pelos serviços de Links Encurtados e Analytics.

## Diagrama de Arquitetura

```
+----------------------------------+       +----------------------------------+
|                                  |       |                                  |
|  Serviço de Links (hexagonal)    |       |  Serviço de Analytics           |
|                                  |       |                                  |
|  +----------------------------+  |       |  +----------------------------+  |
|  |                            |  |       |  |                            |  |
|  |  Domain                    |  |       |  |  Domain                    |  |
|  |  - Link                    |  |       |  |  - Analytics               |  |
|  |  - LinkRepository          |  |       |  |  - AnalyticsRepository     |  |
|  |                            |  |       |  |                            |  |
|  +----------------------------+  |       |  +----------------------------+  |
|                                  |       |                                  |
|  +----------------------------+  |       |  +----------------------------+  |
|  |                            |  |       |  |                            |  |
|  |  Application               |  |       |  |  Application               |  |
|  |  - CreateLinkUseCase       |  |       |  |  - CreateAnalyticsUseCase  |  |
|  |  - RedirectLinkUseCase     |  |       |  |  - GetAnalyticsUseCase     |  |
|  |  - GetLinkAnalyticsUseCase |  |       |  |  - LinkServicePort         |  |
|  |  - AnalyticsServicePort    |  |       |  |                            |  |
|  +----------------------------+  |       |  +----------------------------+  |
|                                  |       |                                  |
|  +----------------------------+  |       |  +----------------------------+  |
|  |                            |  |       |  |                            |  |
|  |  Adapters                  |  |       |  |  Adapters                  |  |
|  |  - PrismaLinkRepository    |  |       |  |  - PrismaAnalyticsRepo     |  |
|  |  - LinkController          |  |       |  |  - AnalyticsController     |  |
|  |  - AnalyticsServiceAdapter |  |       |  |  - LinkServiceAdapter      |  |
|  |                            |  |       |  |                            |  |
|  +----------------------------+  |       |  +----------------------------+  |
|                                  |       |                                  |
+----------------------------------+       +----------------------------------+
           |                                              ^
           |                                              |
           |           HTTP API Calls                     |
           +--------------------------------------------->+
                      (trackVisit, getAnalytics)
```

## Fluxo de Comunicação

1. **Registro de Visita**:

   - Um usuário acessa um link encurtado
   - O `RedirectLinkUseCase` no serviço de Links é acionado
   - O `AnalyticsServiceAdapter` envia os dados da visita para o serviço de Analytics
   - O `CreateAnalyticsUseCase` no serviço de Analytics processa e armazena os dados

2. **Consulta de Analytics**:
   - Um usuário solicita estatísticas de um link
   - O `GetLinkAnalyticsUseCase` no serviço de Links é acionado
   - O `AnalyticsServiceAdapter` solicita os dados ao serviço de Analytics
   - O `GetAnalyticsUseCase` no serviço de Analytics retorna os dados

## Benefícios desta Arquitetura

1. **Desacoplamento**: Os serviços são independentes e se comunicam através de interfaces bem definidas
2. **Escalabilidade**: Cada serviço pode ser escalado de acordo com suas necessidades específicas
3. **Manutenção**: Mudanças em um serviço não afetam o outro, desde que as interfaces sejam mantidas
4. **Testabilidade**: Cada componente pode ser testado isoladamente
5. **Evolução Independente**: Cada serviço pode evoluir independentemente, desde que mantenha a compatibilidade com as interfaces
