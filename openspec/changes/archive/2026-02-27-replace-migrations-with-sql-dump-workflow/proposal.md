## Why

O workflow atual com migrations nao reflete o processo real da equipe, que recebe o schema do banco por dump SQL. Precisamos trocar para um fluxo baseado em `schema.sql` para simplificar setup e manutencao de ambiente de desenvolvimento.

## What Changes

- **BREAKING** Substituir o padrao de evolucao de schema baseado em Knex migrations por fluxo orientado a dump SQL versionado no repositorio.
- Add um arquivo canonico `schema.sql` como fonte de verdade para criar/recriar o banco em desenvolvimento.
- Add `schema.sql` inicial com schema de `blog_posts` para manter o kickstart funcional sem depender de migrations.
- Add comando de Makefile para inicializar banco recriando tudo a partir do dump (`make dbinit`).
- Atualizar documentacao e contrato de desenvolvimento para deixar explicito que queries continuam com Knex, sem migrations/modelos.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `database-knex`: altera o requisito de gerenciamento de schema para usar dump SQL em vez de migrations Knex.

## Impact

- Affected code: configuracao/uso de banco, automacao no Makefile, scripts auxiliares de banco e documentacao de setup.
- Affected code: configuracao/uso de banco, automacao no Makefile, `schema.sql` com tabela inicial de blog posts e documentacao de setup.
- APIs: sem mudanca de contrato HTTP.
- Dependencies/systems: MariaDB em dev passa a ser sempre recriado a partir de `schema.sql`; Knex permanece como query builder para runtime.
