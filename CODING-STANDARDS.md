## コーディング規約
### はじめに
本コーディング規約はNext.jsのドキュメントはもちろん、[Next.jsの考え方](https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/intro)に大いに着想を得ているため、一読することをお勧めします

### 共通
- 本PRでは、Claude Codeをエージェントとして使用しており、Spec driven developmentを行うため、[cc-sdd](https://github.com/gotalab/cc-sdd)を導入している
  - したがって、Spec driven developmentを実施する場合、cc-sddのドキュメントに従って実施すること
  - また、適宜Steeringを実施し、ドキュメントの最新化を行うこと
- CLAUDE.mdは常に最新のプロジェクト状態を反映するかつ、適切にプロジェクトの内容が反映されていること（更新時のデグッションがないことはmustで確認すること）
- routingの機能および、Suspenseを活用し、適切なチャンク化を行うこと
- slotsの概念やComposition Patternを活用し、Client Module Graphを小さくし、Clientに送信されるJSバンドルを小さくすること（RSC内に移せる記述は移し、Server Module Graphを大きくする方針とする）
- 本プロジェクトでは[React Compiler](https://ja.react.dev/learn/react-compiler)を使用しているため、原則、`useMemo`や`useCallback`などのメモ化のhooksは不要とします
- PR前に実装者は`bun run build`または`bun run build:clean`を実行し、ビルドが通ることを確認すること
- 開発でDBに変更が必要な場合は、Tursoの「ブランチング」機能を活用し、環境を切り替えること
- "Single source of truth"の原則を徹底すること
  - 定数・型定義など真実の源となるものがある場合、それらを使用し、新たに自前で実装しないこと

### 命名について
- ファイル名・フォルダ名（dynamic routesを除く）はケバブケースを、変数名や関数名はキャメルケースを使用する

### 型定義について
**前提**
1. 今回はAPI層ではHono RPCによるBFFを提供している
2. DB層ではDrizzleによるSchemaを提供している

- 上記のため、大元となる型が存在する場合、上記の型から型を生成・使用すること

以下のように大元となる型を
```ts
import type { InferResponseType } from 'hono'
import type { client } from '~/lib/rpc'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import type { getLastWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'

type DailyReportsInWeeklyReportListTableProps = {
  data: InferResponseType<
    typeof client.api.weeklies.$get,
    200
  >['reports'][number]['dailyReports'][number]['dailyReportMissions']
}

type CreateWeeklyReportFormProps = {
  promises: Promise<
    [Awaited<ReturnType<typeof getProjects>>, Awaited<ReturnType<typeof getMissions>>]
  >
  lastWeeklyReportMissions?: Awaited<ReturnType<typeof getLastWeeklyReportMissions>>
}
```



### 関数定義について
- propsなど、個々人の記述に差異がでないよう関数宣言を使用してください（例: export default async function sample() {}）

### コンポーネント・ディレクトリ戦略について
- コンポーネント戦略は[AHA Programming](https://kentcdodds.com/blog/aha-programming)に従い、性急な抽象化は避けた設計を行うこと
- ディレクトリ戦略は[bulletproof-react](https://github.com/alan2207/bulletproof-react)に従い、実装すること
  - ※ 具体的なディレクトリ構成は「ディレクトリ構成」の項に記載

### データフェッチについて
- RequestMemorizationおよび、並列フェッチ・preloadを活用しデータフェッチのウォーターフォールを避けること
- データフェッチはデータフェッチ コロケーションに従い、末端のリーフコンポーネントで行うこと
- fetchには`src/lib/fetcher.ts`にてfetch関数を拡張した関数を使用すること
  - 使用時は、HonoのPRCによる機能を使用し、urlと`InferResponseType`などで型安全なfetchを実現すること

### cacheについて
- React.cacheやNext.jsの`use cache`を宣言し、適宜、`cacheTag`・`cacheLife`を使用し、On-demand Cacheとすること

### server actionsについて
- Mutationの処理のみに使用してください
  - ※ 絶対にClient Componentでfetchの代替に使用しないでください（左記を実装する場合、[tanstack-query](https://tanstack.com/query/latest)や[SWR](https://swr.vercel.app/ja)などのClient Fetch Libraryの導入を検討してください）
- [with-callback](https://zenn.dev/sc30gsw/articles/6b43b44e04e89e)によるハンドリングを可能な限り使用すること

## ディレクトリ構成
ディレクトリ構成は[bulletproof-react](https://github.com/alan2207/bulletproof-react)に従い、以下の構成とします。
```
/nextjs-suama
  ├ public : 画像などアセット類
  ├ src
  |  ├ app: ルーティング定義
  |  |  ├ api: Route Handler
  |  |  |  └[[...route]] : optional catch-all segmentsによるAPIルート
  |  |  |     └ route.ts: HonoのAPI Route定義
  |  |  ├ layout.tsx: ルートレイアウト
  |  |  ├ page.tsx : ルートページコンポーネント
  |  |  ├ loading.tsx: ルートローディングUI
  |  |  ├ error.tsx : ルートエラーページ（グローバルエラーページ）
  |  |  ├ not-found.tsx : 404ページ
  |  |  ├ unauthorized.tsx : 401ページ
  |  |  ├ globals.css : グローバルスタイル
  |  |  ├ favicon.ico : ファビコン
  |  |  └ sample-route（サンプルルーティング）※ `sample`の部分には画面ごとに本来のパス名が入る
  |  |     ├ layout.tsx : 当該ルーティングにおける共通レイアウト
  |  |     ├ loading.tsx : 当該ルーティングにおけるローディングUI
  |  |     ├ error.tsx : 当該ルーティングにおけるエラーページ
  |  |     └ page.tsx : 当該ルーティングにおけるページコンポーネント
  |  ├ components : アプリ全体で使われるコンポーネント実装
  |  |  ├ providers: アプリ全体で使われるProvider郡
  |  |  |  ├ nuqs-provider.tsx : nuqsのadapterを提供する
  |  |  |  └ *-provider.tsx : その他、任意のProvider
  |  |  └ ui: プロジェクト全体で使用するコンポーネント格納ディレクトリ
  |  |     └ intent-ui: Intent UIのコンポーネントを格納するディレクトリ
  |  |         ├ button.tsx : Intent UIのButton
  |  |         ├ input.tsx : Intent UIのInput
  |  |         ├ card.tsx : Intent UIのCard
  |  |         └ *** : その他のIntent UIのコンポーネント
  |  ├ features : 当該ルーティングにおける機能実装
  |  |  ├ users: 機能に関連するディレクトリをまとめる親ディレクトリ（機能に関連した命名を行う）
  |  |  |   ├ actions : server actionsを格納（server actionsは原則1ファイル（モジュール）1関数としてください）
  |  |  |   |  ├ user-search.ts : ユーザー検索を行うserver actions
  |  |  |   |  └ *.ts : 任意のserver actions
  |  |  |   ├ api : API関連の処理を格納
  |  |  |   |  └ route.ts : APIの実装を行うファイル
  |  |  |   ├ components : 当該機能で使用するコンポーネントをまとめるディレクトリ
  |  |  |   |  ├ user-list.ts : ユーザー一覧をfetch・表示するコンポーネント
  |  |  |   |  └ *.ts : 任意のコンポーネント
  |  |  |   ├ hooks : 当該機能で使用するhooksをまとめるディレクトリ
  |  |  |   |  ├ use-user-search.ts : ユーザー検索で使用するhooks
  |  |  |   |  └ *.ts : 任意の定数ファイル
  |  |  |   ├ types : 当該機能で使用する型定義をまとめるディレクトリ
  |  |  |   |  ├ schema : zod schemaをまとめるディレクトリ
  |  |  |   |  |  ├ user-search-schema.ts : user検索で使用するzod schema
  |  |  |   |  |  └ *.ts : 任意のzod schema
  |  |  |   |  ├ search-params : nuqsのsearch paramsの型定義をまとめるディレクトリ
  |  |  |   |  |  ├ user-search-params.ts : user検索で使用するsearch paramsの型定義
  |  |  |   |  |  └ *.ts : 任意のsearch paramsの型定義
  |  |  |   |  ├ user.ts : userに関する型定義
  |  |  |   |  └ *.ts : 任意の型定義ファイル
  |  |  |   └ utils : 当該機能で使用するユーティリティ定義をまとめるディレクトリ
  |  |  └ *: 任意の機能ディレクトリ
  |  ├ middleware.ts : [ミドルウェア実装](https://nextjs.org/docs/app/building-your-application/routing/middleware)
  |  ├ types : アプリ全体で使われる型定義
  |  |   └ *.ts: 任意の型定義
  |  ├ constants : アプリ全体で使われる定数
  |  ├ db 
  |  |  └ schema.ts : テーブルSchema定義
  |  ├ hooks : アプリ全体で使われるカスタムフック(use-***.ts)
  |  ├ lib :アプリ全体で使用されるライブラリの設定定義や共通ヘルパー関数
  |  ├ env.ts : @t3-oss/env-nextjs による環境変数定義
  |  ├ index.ts : Drizzle ORM のDB定義
  |  └ utils : アプリ全体で使われるユーティリティ実装
  ├ .env.* : 環境変数定義ファイル
  ├ next.config.ts : next.jsの設定ファイル
  ├ intentui.json : Intent UIの設定ファイル
  ├ tailwind.config.ts : tailwind cssの設定ファイル
  ├ postcss.config.mjs : postcssの設定ファイル（主にtailwind cssのプラグイン設定を記述）
  ├ package.json : パッケージマネージャーの設定ファイル
  ├ biome.json : Linter・Formatterの設定ファイル
  └ tsconfig.json : typescriptの設定ファイル
```

## 主要ライブラリ
- [Hono](https://hono.dev/): バックエンドフレームワーク
- [up-fetch](https://github.com/L-Blondy/up-fetch): fetch拡張ライブラリ
- [Tailwind CSS](https://tailwindcss.com/): スタイリングソリューション
- [Intent UI](https://intentui.com/): コンポーネントライブラリ
- [Drizzle](https://orm.drizzle.team/): ORM
- [Better Auth](https://www.better-auth.com/): 認証ライブラリ
- [nuqs](https://nuqs.47ng.com/): クエリパラメータ管理
- [Conform](https://conform.guide/): form管理ライブラリ
- [zod](https://zod.dev/): バリデーションスキーマ定義
- [Remeda](https://remedajs.com/): TypeScriptのユーティリティライブラリ
- [date-fns](https://date-fns.org/docs/Getting-Started): 日付操作ライブラリ
- [react-call](https://github.com/desko27/react-call): Confirmダイアログ管理ライブラリ
- [TanStack Query](https://tanstack.com/query/latest): クライアントfetch ライブラリ
- [TanStack Table](https://tanstack.com/table/latest): Unstyled UI tableライブラリ
- [React Virtuoso](https://virtuoso.dev/): 仮想化レンダリングライブラリ
