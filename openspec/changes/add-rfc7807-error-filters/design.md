## Context

O projeto ja define Zod para validacao e exige tratamento global de erros com formato unico. Hoje nao existe um contrato formal alinhado ao RFC 7807 para todos os caminhos de falha (HTTP exceptions, validacao e erros inesperados), o que dificulta consumo consistente por clientes e padronizacao de testes.

## Goals / Non-Goals

**Goals:**

- Padronizar respostas de erro HTTP no formato Problem Details (`application/problem+json`) com campos obrigatorios do RFC 7807.
- Cobrir tres classes de falha com filtros consistentes: `HttpException`, erro de validacao e excecao inesperada.
- Cobrir quatro classes de falha com filtros consistentes: `HttpException`, erro de validacao, erro de banco de dados e excecao inesperada.
- Definir extensoes previsiveis para detalhar erros de validacao sem quebrar o contrato base.
- Integrar o tratamento global ao bootstrap da aplicacao para impacto transversal minimo no restante dos modulos.

**Non-Goals:**

- Alterar regras de negocio, autenticao/autorizacao ou semantica dos endpoints de sucesso.
- Introduzir novo mecanismo de validacao diferente de Zod.
- Criar observabilidade avancada fora do que ja existe em logs/erro global.

## Decisions

- Usar filtros de excecao do NestJS para mapear erros para RFC 7807 de forma centralizada.
  - Rationale: reduz duplicacao por controller e garante contrato unico para todos os modulos.
  - Alternative considered: tratar erro por interceptor/controller; rejeitado por acoplamento e baixa consistencia.
- Criar um filtro global para erros nao previstos com resposta generica e segura.
  - Rationale: evita vazamento de detalhes internos e garante `status=500` com payload consistente.
  - Alternative considered: repassar stack/erro bruto no body; rejeitado por risco de seguranca.
- Mapear erros de validacao para `400` com extensao `errors` (lista de campos/mensagens) mantendo `type/title/status/detail/instance`.
  - Rationale: preserva conformidade RFC 7807 e melhora UX do frontend para exibicao de erros de formulario.
  - Alternative considered: serializar validacao em formato ad-hoc; rejeitado por falta de padrao.
- Mapear erros de banco (driver MariaDB/Knex) para categorias HTTP previsiveis.
  - Rationale: transforma falhas tecnicas comuns (constraint, timeout, indisponibilidade) em respostas acionaveis para clientes sem expor SQL interno.
  - Alternative considered: tratar todos os erros de banco como `500`; rejeitado por perder semantica para conflitos e indisponibilidade.
- Definir mapeamento inicial de categorias de banco:
  - Violacao de unicidade/chave -> `409 Conflict`.
  - Timeout ou indisponibilidade de conexao -> `503 Service Unavailable`.
  - Demais erros de banco nao classificados -> `500 Internal Server Error` sanitizado.
- Padronizar `type` por categoria de problema com URIs estaveis (ex.: `https://api.ovlk.local/problems/validation-error`).
  - Rationale: facilita classificacao de erros por clientes e telemetria.

## Risks / Trade-offs

- [Diferencas entre formatos atuais e novo contrato] -> Mitigacao: documentar exemplos e cobrir com testes e2e para cenarios principais.
- [Baixa granularidade em erros inesperados] -> Mitigacao: manter detalhes sensiveis apenas em logs internos, nao no payload publico.
- [Dependencia de mapeamento correto de erros de validacao] -> Mitigacao: criar utilitario unico de normalizacao para erros Zod e testar casos de body/params/query.
- [Variacao de codigos de erro entre driver e ambiente] -> Mitigacao: centralizar tabela de mapeamento de erros de banco com fallback seguro para `500`.

## Migration Plan

- Introduzir filtros e utilitario de mapeamento sem remover endpoints existentes.
- Registrar filtros globalmente no bootstrap para ativacao imediata.
- Executar testes unitarios e e2e de erros; ajustar clientes se houver expectativa de payload legado.
- Rollback: remover registro global dos filtros e restaurar comportamento anterior de excecoes.

## Open Questions

- Definir URL base final para `type` em ambientes nao locais (dev/staging/prod).
- Confirmar se respostas 401/403 devem incluir campos adicionais padrao alem do RFC 7807 base.
- Confirmar a lista inicial de codigos de erro MariaDB que precisam de mapeamento explicito na primeira entrega.
