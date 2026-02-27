## Context

O projeto usa Knex como query builder sem ORM, mas o schema de banco hoje ainda presume workflow de migrations/seeds. Na pratica, a equipe recebe o schema oficial por dump SQL e quer aplicar esse dump diretamente em desenvolvimento para manter alinhamento com producao.

## Goals / Non-Goals

**Goals:**

- Trocar o fluxo de evolucao de schema de migrations Knex para dump SQL versionado (`schema.sql`).
- Definir comando operacional simples no Makefile para inicializar o banco local recriando tudo a partir do dump.
- Manter Knex apenas para conexao e queries em runtime, sem introduzir models/entities.
- Tornar o workflow reproduzivel no ambiente Docker de desenvolvimento.

**Non-Goals:**

- Alterar contratos HTTP ou comportamento de endpoints.
- Introduzir ORM ou abstrair queries SQL fora do Knex.
- Implementar migracoes incrementais automáticas para producao nesta mudanca.

## Decisions

- Usar `schema.sql` como fonte unica de verdade para schema em dev.
  - Rationale: representa o fluxo real da equipe e reduz divergencia entre banco local e dump oficial.
  - Alternative considered: manter migrations e gerar dump delas; rejeitado por duplicar manutencao.
- Definir um unico comando no Makefile:
  - `dbinit`: recria banco local do zero e aplica `schema.sql`.
  - Rationale: manter fluxo simples, deterministico e sem estados intermediarios de patch/update.
- Remover dependencia operacional de Knex CLI para evolucao de schema.
  - Rationale: evita mismatch entre estrategia de migracao e processo real de dump.
  - Alternative considered: wrappers de `knex migrate`; rejeitado por manter paradigma antigo.
- Preservar padrao de testes e validacoes de setup para garantir que comandos falhem com erro claro quando dump ausente/invalido.

## Risks / Trade-offs

- [Aplicacao de dump e destrutiva por definicao] -> Mitigacao: documentar claramente que `dbinit` recria o banco e deve ser usado em desenvolvimento.
- [Dump pode ficar desatualizado em relacao a producao] -> Mitigacao: processo explicito de substituir `schema.sql` e rerodar comando.
- [Comandos SQL podem variar entre ambientes] -> Mitigacao: executar via MariaDB do compose dev e padronizar encoding/opcoes.

## Migration Plan

- Introduzir `schema.sql` e comandos de Makefile.
- Atualizar docs para novo fluxo e descontinuar instrucoes de migrations.
- Ajustar testes e checks relacionados a schema provisioning.
- Rollback: restaurar fluxo anterior de migrations se necessario, com reintroducao dos comandos/documentacao antigos.

## Open Questions

- Nenhuma no momento; a diretriz e usar apenas `schema.sql` + `dbinit` com recriacao completa.
