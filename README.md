# Website CRIEC

Frontend do site institucional do CRIEC

## Tecnologias

| Categoria   | Tecnologia           |
| ----------- | -------------------- |
| Framework   | React 19             |
| Linguagem   | TypeScript           |
| Build Tool  | Vite                 |
| Estilização | Tailwind CSS 4       |
| Componentes | Radix UI + shadcn/ui |
| Navegação   | React Router         |
| SEO         | React Helmet Async   |

---

## Branches

### `main`

Branch principal de desenvolvimento.

Todo desenvolvimento de features deve ocorrer nesta branch ou em branches derivadas dela.

### `prod`

Branch de produção.

Não deve receber commits manuais. Sua atualização ocorre exclusivamente através do processo de deploy.

---

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

Inicie o ambiente local:

```bash
npm run dev
```

### Atualizações

Antes de criar um commit execute:

```bash
npm run prep
```

Esse comando executa:

1. Prettier (`format`)
2. ESLint (`lint`)
3. TypeScript (`typecheck`)

Caso alguma etapa falhe, o processo é interrompido.

---

Para atualizar a versão do projeto:

```bash
npm version patch|minor|major
```

- Atualiza a versão em `package.json`
- Cria um commit
- Cria uma tag Git local

Para enviar commits e tags:

```bash
git push --follow-tags
```

## Deploy

Para publicar uma nova versão:

```bash
npm run deploy
```

O script de deploy [(scripts/deploy.js)](scripts/deploy.js):

1. Verifica se existem alterações não commitadas.
2. Confirma que a versão do `package.json` corresponde à tag do `HEAD`(se existir).
3. Atualiza a branch `prod` usando um squash merge da `main`.
4. Cria um commit de deploy.
5. Faz push para o repositório remoto.
6. Retorna para a branch `main`.

### Post-build

Após o build, o script:

```text
scripts/post-seo.js
```

gera automaticamente:

- `dist/sitemap-static.xml`
- `dist/sitemap.xml`
- `dist/robots.txt`

A variável de ambiente `VITE_SITE_URL` deve estar definida:

---

## Integração Contínua

O repositório possui um workflow [`deploy.yml`](.github/workflows/deploy.yml) que é disparado a cada push na branch `prod`.

### Etapas

**1. Build** (`ubuntu-latest`)

- Faz checkout do repositório
- Instala as dependências com `npm ci`
- Executa `npm run build`
- Sobe o conteúdo de `dist/` como artefato

**2. Deploy** (runner `self-hosted`)

- Baixa o artefato gerado
- Salva o build em `DEPLOY_PATH/<run>-<sha>`

### Variáveis de ambiente

As variáveis necessárias para o build são cadastradas em **Settings → Secrets and variables → Actions** no GitHub:

| Variável      | Descrição                                |
| ------------- | ---------------------------------------- |
| `DEPLOY_PATH` | Caminho base para os deploys no servidor |
