This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## コーディング規約
[CODING-STANDARDS.md](CODING-STANDARDS.md)を参照すること

## 環境構築
以下の手順にしたがい、環境構築を行ってください
### 1. envファイルの作成
```bash
# you can pick out any env file's name you like.
touch .env
```

### 2. envファイルに以下の内容を記述
```txt: .env
NEXT_PUBLIC_APP_URL = http://localhost:3000
TURSO_DATABASE_URLL = {NotePMにて共有}
TURSO_AUTH_TOKEN = {NotePMにて共有}
BETTER_AUTH_SECRET = openssl rand -base64 32
BETTER_AUTH_URL = http://localhost:3000
```

### 3. 依存関係のインストール
```bash
bun i
```

### 4. 開発サーバーの起動
```bash
bun dev
```

### 5. 各種Schema生成について
## Better Auth CLIによるSchema生成
```sh
bunx @better-auth/cli generate
```

## drizzle-kitによるTurso migration
```sh
bunx drizzle-kit push
```

or

```sh
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

## Tursoによるブランチング
```sh
# 既存データベース old-db から新しいブランチ new-db を作成
turso db create new-db --from-db old-db
```

```sh
# 不要になったブランチは手動で削除
turso db destroy new-db
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
