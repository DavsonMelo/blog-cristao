# blog-cristao

# ❤️ Blog Cristão — README

> Um blog simples, com alma e propósito: mensagens espirituais com imagens marcantes.

Este repositório é a base do **Blog Cristão** — um site feito com Next.js (App Router), Firebase (Auth + Firestore) e Cloudinary para uploads. O objetivo é ser simples, performático e fácil de escalar. Este README vai te orientar a rodar o projeto localmente, explicar a arquitetura e trazer o checklist de melhorias que vamos aplicar (passo a passo).

---

# 📌 Visão geral

- **Frontend:** Next.js 13+ (App Router), React (componentes client-side onde necessário).
- **Autenticação:** Firebase Authentication (Client SDK) + Session Cookies via Firebase Admin (para SSR e proteção de APIs).
- **Banco de dados:** Firestore (posts, users, comentários, likes).
- **Uploads:** Cloudinary (rota server-side `api/upload`) — usado para hospedar imagens finais.
- **Outros:** `react-toastify` para feedback, `date-fns` para datas, e hooks customizados para auto-save de rascunhos.

---

# ✨ Objetivo do projeto

Criar um espaço simples e elegante para compartilhar mensagens espirituais curtas acompanhadas de imagens fortes — cada post precisa de imagem para reforçar a mensagem.

---

# 🎯 Principais funcionalidades

- Cadastro/login (email, Google, GitHub)
- Sessão persistente via cookie (`/api/sessionLogin` / `sessionLogout`)
- Criação de posts com imagem obrigatória e preview de rascunho
- Lista de posts com paginação
- Detalhe do post com comentários e likes (transações no Firestore)
- Uploads tratados por rota server-side (Cloudinary)

---

# 🧭 Arquitetura (resumida)

- `app/` → Next.js App Router (páginas, componentes e API routes)
- `app/components/` → componentes reutilizáveis (Header, AuthModal, PostList, etc.)
- `app/context/` → contextos React (DraftPost e Auth disponível)
- `app/api/` → rotas de backend (`sessionLogin`, `sessionLogout`, `upload`)
- `lib/` → configurações do Firebase (client e admin) e tipos

---

# 🚀 Como rodar localmente

1. Clone o repositório:

```bash
git clone <seu-repo>
cd <seu-repo>
```

2. Instale dependências:

```bash
npm install
# ou
yarn
```

3. Crie um arquivo `.env.local` com as variáveis necessárias (exemplos abaixo).

4. Rode em modo dev:

```bash
npm run dev
# ou
yarn dev
```

5. Abra `http://localhost:3000`.

---

# 🔐 Variáveis de ambiente (sugestão)

> Abaixo está um conjunto típico de variáveis que o projeto espera. Adapte conforme seu setup do Firebase e Cloudinary.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (para rota server-side). Alternativa: ajuste conforme sua forma de autenticação admin
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Ambiente
NODE_ENV=development

```

**Nota**: Guarde a `FIREBASE_PRIVATE_KEY` com cuidado. No Vercel/Netlify use o painel de variáveis de ambiente.

---

# 🧩 Boas práticas e dicas rápidas

- **Imagem obrigatória:** Todos os posts exigem imagem. O preview usa `URL.createObjectURL` (blob) — por isso o preview deve usar `<img>` nativo. Imagens finais (salvas no Cloudinary) devem ser renderizadas com `next/image`.
- **Sessões:** Mantenha a criação e a remoção do cookie no fluxo de login/logout para garantir SSR seguro.
- **Listeners:** Evite espalhar `onAuthStateChanged` em múltiplos componentes; prefira um ponto central (AuthProvider) se decidir padronizar.

---

# ✅ Checklist (tarefas gerais)

> Vamos usar esse checklist para evoluir o projeto passo a passo. Marque o que for concluído.

## 📌 Autenticação & Sessão

- [ ] Unificar lógica de autenticação (Firebase Auth + Session Cookie API)
- [ ] Criar hook `useAuth()` para centralizar login, logout e estado do usuário
- [ ] Garantir expiração e renovação de sessões no backend
- [ ] Bloquear rotas privadas via middleware

## 🖼️ Posts & Imagens

- [ ] Tornar **imagem obrigatória** na criação de posts
- [ ] Substituir `<img>` por `next/image` (com fallback para preview local)
- [ ] Resolver problema de preview com `URL.createObjectURL` (revogar URLs no `useEffect`)
- [ ] Validar formatos e tamanho de imagem antes do upload
- [ ] Criar UI de erro para upload falho

## 📝 PostList & Performance

- [ ] Evitar consultas duplicadas de usuários no `PostList`
- [ ] Implementar **skeleton loaders** enquanto posts carregam
- [ ] Migrar "Carregar mais" para **infinite scroll**
- [ ] Cachear autores já buscados para reduzir leituras no Firestore
- [ ] Tratar casos em que `createdAt` não existe ou está corrompido

## 🎨 UI/UX

- [ ] Padronizar botões (usar componentes reutilizáveis)
- [ ] Melhorar modal de login (`AuthModal`) com animações suaves
- [ ] Adicionar feedback visual (toasts) para login/logout e posts criados
- [ ] Criar layout responsivo para mobile (grid de posts adaptável)

## ⚙️ Infraestrutura

- [ ] Criar logger centralizado para erros (ex: hook ou serviço)
- [ ] Configurar variáveis de ambiente com validação (Zod ou similar)
- [ ] Configurar ESLint + Prettier no projeto
- [ ] Implementar testes básicos de integração (Jest + React Testing Library)
- [ ] Habilitar segurança extra nos cookies (SameSite, Secure)

## 🌟 Extras Futuro

- [ ] Curtidas e comentários em tempo real
- [ ] Notificações in-app para interações
- [ ] Painel de administração para moderar posts
- [ ] Internacionalização (i18n) para outros idiomas

---
