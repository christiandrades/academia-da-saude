# Academia da Saúde Arapiraca

Instruções rápidas para desenvolvimento local.

Variáveis de ambiente necessárias (exemplo em `.env.example`):

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- JWT_SECRET

No Windows (cmd) você pode definir temporariamente antes de iniciar o dev server:

```
set GOOGLE_CLIENT_ID=your-google-client-id
set GOOGLE_CLIENT_SECRET=your-google-client-secret
set GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
set JWT_SECRET=your_jwt_secret
npm install
npm run dev
```

Ou crie um arquivo `.env` a partir de `.env.example` e use sua ferramenta preferida para carregar variáveis.

Front-end: React + Vite. Back-end: Cloudflare Worker (Hono) com D1.

## Academia da Saúde Arapiraca

This app was created using <https://getmocha.com>.
Need help or want to join the community? Join our [Discord](https://discord.gg/shDEGBSe2d).

To run the devserver:

```
npm install
npm run dev
```
