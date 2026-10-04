# Conectar a lista de presentes ao Neon

## Encontrar as URLs no console

1. Abra o projeto `casamento-isaac-sarah` no Neon.
2. Clique no botão verde **Connect**, no menu esquerdo.
3. Na janela **Connect to your branch**, selecione a branch `production`, o compute existente, o banco existente (normalmente `neondb`) e o usuário/role existente (normalmente `neondb_owner`). Não crie outra branch só para copiar a conexão.
4. Ligue **Connection pooling**. Em **Connection string**, copie a URL completa iniciada por `postgresql://`. O hostname desta conexão contém `-pooler`.
5. Se o formato selecionado for `psql`, o snippet poderá incluir o comando e aspas. Para a variável de ambiente, copie somente a URL, sem o comando `psql` e sem as aspas externas.
6. Preserve todos os parâmetros que o console mostrar, inclusive `sslmode=require` e, quando presente, `channel_binding=require`.
7. Desligue temporariamente **Connection pooling** e copie também a URL direta (sem `-pooler`), destinada à criação e manutenção das tabelas. Ambas apontam para o mesmo banco.

## Guardar as credenciais com segurança

A URL de conexão inclui a senha do banco. Não cole a URL completa em conversas, prints, código-fonte, documentação ou repositórios Git. Guarde-a em um gerenciador de senhas ou nas variáveis de ambiente da hospedagem.

Variáveis:

- `DATABASE_URL`: URL pooled do Neon. É utilizada pelo site, somente no servidor.
- `DATABASE_URL_UNPOOLED`: URL direta do mesmo banco, opcional, preferida pelo Drizzle Kit para schema/migrações.
- `ADMIN_PASSWORD`: senha de administração, também somente no servidor.

Nunca use o prefixo `NEXT_PUBLIC_` nessas variáveis: esse prefixo expõe o valor ao navegador.

No Vercel: **Project → Settings → Environment Variables**. Configure `DATABASE_URL` para **Production**, marcando como sensível quando essa opção estiver disponível. Antes da primeira publicação, configure também a senha administrativa. Caso use Preview, conecte-o a um banco/branch de teste separado, não ao banco que registra os presentes dos convidados.

Para comandos locais, defina as variáveis em um `.env.local` não versionado ou no ambiente do terminal. `drizzle.config.ts` carrega `.env.local` e `.env` sem sobrescrever variáveis já definidas no ambiente.

## Esta etapa ainda não publica o site

O Neon guarda os dados. O endereço que será colocado no casar.com será o endereço HTTPS final da hospedagem do site, não a URL `postgresql://` do banco e não um preview temporário E2B.

Copiar as URLs não cria as tabelas nem migra fotos, presentes ou compras. A configuração do banco e a migração dos dados personalizados devem ser concluídas antes de divulgar o site.

## Documentação oficial

- https://neon.com/docs/connect/connect-from-any-app
- https://neon.com/docs/connect/connection-pooling
