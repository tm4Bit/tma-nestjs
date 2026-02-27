## Why

Atualmente, os erros da API nao seguem um contrato unico e padronizado para clientes HTTP. Precisamos padronizar respostas de excecao para melhorar previsibilidade, depuracao e interoperabilidade, incluindo suporte explicito ao RFC 7807.

## What Changes

- Add filtros de excecao para `HttpException` e erros de validacao com payload no formato Problem Details (`application/problem+json`).
- Add um filtro global para excecoes nao previstas, retornando resposta segura e consistente no mesmo formato RFC 7807.
- Add tratamento padronizado para erros de banco de dados (Knex/MariaDB), com mapeamento para status HTTP e `type` especifico.
- Garantir mapeamento consistente de campos (`type`, `title`, `status`, `detail`, `instance`) e extensoes uteis para erros de validacao.
- Definir comportamento de serializacao de erros para manter contrato uniforme entre modulos.

## Capabilities

### New Capabilities

- `api-error-handling-rfc7807`: define o contrato de resposta de erro da API usando RFC 7807 para excecoes HTTP, validacao e erros inesperados.
- `database-error-problem-details`: define o mapeamento de erros de banco (constraint, indisponibilidade, timeout) para Problem Details.

### Modified Capabilities

- Nenhuma.

## Impact

- Affected code: filtros globais de excecao, camada de bootstrap da aplicacao e tratamento de validacao.
- Affected code: filtros globais de excecao, camada de bootstrap da aplicacao, normalizacao de erros de validacao e mapeamento de erros Knex/MariaDB.
- APIs: respostas de erro passam a ter formato padrao Problem Details para consumidores HTTP.
- Dependencies/systems: sem nova dependencia obrigatoria; usa mecanismos nativos do NestJS e validacao ja existente.
