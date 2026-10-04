# Guia de publicação — Lista de presentes Isaac & Sarah

O banco de dados (Neon) já está pronto com os 110 presentes, as fotos e a chave PIX.
Falta: subir o código no GitHub → publicar na Vercel → colar o link no casar.com.

---

## Passo 0 — Trocar a senha do banco (obrigatório antes de divulgar)

1. Entre em neon.tech → projeto **casamento-isaac-sarah**.
2. Menu esquerdo → **Roles** → no usuário `neondb_owner`, clique nos três pontinhos → **Reset password**.
3. Clique em **Connect** (botão verde), ligue **Connection pooling** e copie a string completa.
   Guarde no bloco de notas: ela é a sua `DATABASE_URL`.

---

## Passo 1 — Criar o repositório no GitHub

1. Crie uma conta em github.com (se ainda não tiver).
2. Clique em **+** (canto superior direito) → **New repository**.
3. Nome: `lista-presentes-isaac-sarah`. Marque **Private**. Não marque nenhuma outra opção.
4. Clique em **Create repository**.
5. Na página que abrir, clique no link **uploading an existing file**.
6. Descompacte o arquivo `lista-presentes-isaac-sarah.zip` no seu computador.
7. Abra a pasta descompactada, selecione **tudo o que está dentro dela** (Ctrl+A) e arraste para a página do GitHub.
   - Arraste o conteúdo, não a pasta em si. O arquivo `package.json` precisa ficar na raiz.
8. Espere terminar de carregar e clique em **Commit changes**.

---

## Passo 2 — Publicar na Vercel

1. Entre em vercel.com → **Sign up** → **Continue with GitHub** (plano Hobby, gratuito).
2. **Add New… → Project** → ao lado de `lista-presentes-isaac-sarah`, clique em **Import**.
3. Framework: **Next.js** (já vem detectado). Não mude nada em Build.
4. Abra **Environment Variables** e adicione duas:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | a string do Neon do Passo 0 |
   | `ADMIN_PASSWORD` | uma senha nova e forte só sua |

5. Clique em **Deploy** e espere uns 2 a 3 minutos.
6. Quando aparecer "Congratulations", clique em **Continue to Dashboard** e copie o endereço em **Domains**
   (algo como `lista-presentes-isaac-sarah.vercel.app`).

Dica: em **Settings → Domains** você pode trocar o nome para algo mais bonito, como `isaac-e-sarah.vercel.app`.

---

## Passo 3 — Testar antes de divulgar

Troque `SEU-SITE` pelo endereço da Vercel:

- Convidados: `https://SEU-SITE.vercel.app/`
- Edição de fotos: `https://SEU-SITE.vercel.app/?editar` (depois clique em **Editar** ou Ctrl+Shift+E)
- Área dos noivos: `https://SEU-SITE.vercel.app/admin` (senha = `ADMIN_PASSWORD`)

Checklist:
1. Abra a lista no celular e no computador.
2. Escolha um presente, gere o PIX e aponte a câmera do app do banco. Confira se aparece o nome do titular.
3. Faça um PIX de verdade de valor baixo e clique em "Já fiz o PIX".
4. Entre no /admin → **Acompanhamento** e veja se a compra apareceu.
5. Feche tudo, abra no dia seguinte: a compra deve continuar lá.
6. No /admin, use **Não caiu, liberar** ou apague esse teste.

---

## Passo 4 — Colocar no casar.com

1. No editor do site no casar.com, adicione um botão ou link no menu.
2. Texto: `Lista de presentes 💙`
3. Link: `https://SEU-SITE.vercel.app/` — **sem** o `?editar`.
4. Salve e teste clicando como se fosse convidado, pelo celular.

---

## Fotos dos presentes

- No site publicado, use **links de imagem**: no Google Imagens, clique com o botão direito na foto →
  **Copiar endereço da imagem** → cole no campo Foto → **Salvar foto e descrição**.
- O botão "Enviar foto do computador" não funciona na Vercel (o servidor não guarda arquivos).

## Backup

No /admin → **Acompanhamento** → **Baixar planilha**. Faça isso de vez em quando e depois do casamento.

## Se algo der errado no deploy

Na Vercel, abra o deploy com erro → **Build Logs**, copie as últimas linhas e me envie.
