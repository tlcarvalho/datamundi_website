# DataMundi — Site (v4)

Site do laboratório **DataMundi** (Ciência de Dados em Relações Internacionais), construído com
[Eleventy (11ty)](https://www.11ty.dev/) — um gerador de site estático. O design é idêntico ao da
versão anterior; o que mudou é que **estrutura e conteúdo agora estão separados**, para facilitar a
edição sem mexer no código.

---

## Como editar o conteúdo

Você quase nunca precisa tocar no HTML/CSS. Todo o conteúdo editável fica em arquivos de dados:

### `_data/` — listas e textos do site
| Arquivo | O que controla |
|---|---|
| `site.json` | Nome, logo, menu, e-mail, redes sociais e textos do rodapé |
| `home.json` | Página inicial: título do hero, subtítulo, botões, frentes, estatísticas, ticker e chamadas |
| `linhas.json` | Linhas de pesquisa (campos: `n`, `titulo`, `descricao`) |
| `noticias.json` | Notícias (campos: `tag`, `titulo`, `resumo`, `data`, `imagem`) |
| `publicacoes.json` | Publicações (campos: `tipo`, `titulo`, `autores`, `revista`, `ano`, `doi`) |
| `equipe.json` | Equipe, agrupada em professores / pós-graduandos / graduandos (campos: `nome`, `cargo`) |
| `edicoes.json` | Edições do boletim (campos: `num`, `titulo`, `data`) |
| `quemsomos.json` | Textos da página "Quem Somos" |
| `boletim.json` | Textos e formulário da página "Boletim" |

> **Adicionar uma notícia:** abra `_data/noticias.json` e copie um bloco `{ ... }`, alterando os
> campos. Para incluir uma imagem, coloque o arquivo em `assets/img/` e aponte o campo `imagem`
> para `/assets/img/nome-do-arquivo.jpg` (deixe `""` para usar o espaço reservado).

Alguns textos específicos de uma página (como os filtros de Notícias/Publicações) ficam no
**frontmatter** — o bloco entre `---` no topo dos arquivos `.njk`.

### Estrutura do projeto
```
v4/
├── _includes/base.njk     ← cabeçalho, menu e rodapé (layout compartilhado)
├── _data/                 ← todo o conteúdo editável (arquivos .json)
├── assets/
│   ├── css/style.css      ← estilos (design intocado)
│   ├── js/main.js         ← interações (globo, animações, filtros, formulário)
│   └── img/logo.png       ← imagens
├── index.njk              ← página inicial
├── quem-somos.njk
├── noticias.njk
├── publicacoes.njk
└── boletim.njk
```

---

## Rodar localmente

Requer [Node.js](https://nodejs.org/) 18+.

```bash
cd v4
npm install      # instala o Eleventy (só na primeira vez)
npm start        # abre em http://localhost:8080 com recarga automática
```

Para gerar a versão final (pasta `_site/`):
```bash
npm run build
```

---

## Publicar no GitHub + Netlify

1. **GitHub** — crie um repositório e envie o conteúdo desta pasta:
   ```bash
   cd v4
   git init
   git add .
   git commit -m "DataMundi site v4 (Eleventy)"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/datamundi-site.git
   git push -u origin main
   ```

2. **Netlify** — em [app.netlify.com](https://app.netlify.com): **Add new site → Import an existing
   project** e selecione o repositório. As configurações já vêm prontas no `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`

   É só confirmar. A cada `git push`, o Netlify reconstrói e publica o site automaticamente.

> **Dica:** para receber os cadastros do boletim de verdade, o Netlify tem
> [Netlify Forms](https://docs.netlify.com/forms/setup/) — posso conectar quando quiser.
