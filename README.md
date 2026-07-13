# CTR FITNESS

Web App profissional para gerenciamento de treinos de uma academia.
Um único personal, múltiplos alunos.

**Stack:** React 18 + Vite + Firebase (Auth + Firestore) + React Router. PWA instalável.

---

## 1. Instalação

Pré-requisitos: **Node.js 18+** e **npm** (ou bun/pnpm).

```bash
git clone <seu-repositorio>
cd ctr-fitness
npm install
```

## 2. Rodar em desenvolvimento

```bash
npm run dev
```

O app abre em `http://localhost:8080`.

## 3. Configurar o Firebase

1. Acesse https://console.firebase.google.com e crie um projeto.
2. Em **Configurações do Projeto → Seus Apps → Adicionar app Web**, copie o objeto `firebaseConfig`.
3. Abra `src/services/firebase.js` e cole no lugar dos placeholders (`SUA_API_KEY`, etc).
4. No console do Firebase, ative:
   - **Authentication → Sign-in method:** Email/Password **e** Google.
   - **Firestore Database:** criar banco em modo produção (ajuste as regras — sugestão abaixo).

### Regras sugeridas do Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada aluno lê/escreve o próprio perfil e a própria ficha
    match /alunos/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /fichas/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null; // personal escreve autenticado
    }
  }
}
```

> Como o Personal usa credenciais fixas (sem Firebase Auth), para produção
> recomenda-se restringir o Firestore via regras específicas ou migrar o
> login do personal para o Firebase Auth com uma flag `role: "personal"`.

## 4. Publicar na Vercel

1. Suba o projeto para o GitHub.
2. Em https://vercel.com/new, importe o repositório.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Clique em **Deploy**. Pronto.

O PWA é instalável direto do navegador após publicado.

## 5. Adicionar vídeos

1. Copie o `.mp4` para a pasta correta em `public/videos/<categoria>/`.
   Ex: `public/videos/peito/supino-reto.mp4`
2. Abra `public/videos/videos.json` e adicione uma nova entrada:

```json
{
  "titulo": "Crucifixo",
  "categoria": "Peito",
  "arquivo": "/videos/peito/crucifixo.mp4",
  "descricao": "Isolamento do peitoral."
}
```

**Nenhum outro arquivo precisa ser alterado.**

## 6. Adicionar nova categoria

1. Abra `src/services/videos.js`.
2. Adicione o nome no array `CATEGORIAS`.
3. Crie a pasta `public/videos/<nome-minusculo>/`.
4. Adicione vídeos com essa categoria no `videos.json`.

## 7. Trocar logo

Substitua o arquivo `public/img/logo.svg` (ou `.png`) pela sua logo.
A logo é exibida na tela de login.

## 8. Trocar banner

Substitua o arquivo `public/img/banner.jpg` pelo seu banner.
O banner é exibido no topo da tela de login.

## 9. Alterar usuário e senha do Personal

Abra `src/services/personalConfig.js`:

```js
export const PERSONAL_USER = "PERSONAL";
export const PERSONAL_PASS = "CTR26";
```

Modifique os valores. Nenhum outro arquivo precisa ser alterado.

## 10. Estrutura do projeto

```
src/
  components/       ← Componentes reutilizáveis (BottomNav, VideoPlayer, Toast)
  pages/            ← Todas as páginas do app
    aluno/          ← Home, Videos, MinhaFicha, Perfil
    personal/       ← Dashboard, Alunos, CriarFicha, Login
  services/         ← Firebase, autenticação, fichas, pdf
  styles/           ← global.css (design system)
  assets/           ← Imagens usadas via import ES6
public/
  img/              ← logo, banner, ícones do PWA
  videos/
    videos.json     ← catálogo de vídeos
    peito/ costas/ pernas/ ombro/ biceps/ triceps/
    abdomen/ cardio/ alongamento/ mobilidade/
```

## Suporte

Todos os arquivos possuem comentários explicando o que fazem e como modificá-los.