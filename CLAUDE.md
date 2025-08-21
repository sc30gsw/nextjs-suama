<?xml version="1.0" encoding="UTF-8"?>
<project-guidance>
  <metadata>
    <version>1.0</version>
    <created-date>2025-07-10</created-date>
    <target-ai>Claude Code (claude.ai/code)</target-ai>
    <project-name>nextjs-suama (工数管理・レポートシステム)</project-name>
    <language>日本語</language>
    <encoding>UTF-8</encoding>
  </metadata>

  <ai-operation-principles priority="highest">
    <principle number="1">AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。</principle>
    <principle number="2">AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。</principle>
    <principle number="3">AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。</principle>
    <principle number="4">AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。</principle>
    <principle number="5">AIはCLAUDE.mdの禁止事項を破らず、README.mdのコーディング規約に従った開発を行う。</principle>
    <principle number="6">AIは全てのチャットの冒頭にこの6原則を逐語的に必ず画面出力してから対応する。</principle>
  </ai-operation-principles>

  <development-commands>
    <category name="development-server">
      <command>
        <execute>bun dev</execute>
        <description>Turbopackを使用して開発サーバーを起動</description>
      </command>
    </category>
    
    <category name="build">
      <command required="before-pr">
        <execute>bun run build:clean</execute>
        <description>クリーンビルド（.nextディレクトリを削除してからビルド）</description>
        <priority>high</priority>
      </command>
      <command>
        <execute>bun run build</execute>
        <description>標準的な本番ビルド</description>
      </command>
    </category>
    
    <category name="code-quality">
      <command>
        <execute>bun run format</execute>
        <description>Biomeでコードをフォーマット</description>
      </command>
      <command>
        <execute>bun run lint</execute>
        <description>Biomeリンターを自動修正付きで実行</description>
      </command>
      <command>
        <execute>bun run check:biome</execute>
        <description>Biomeチェックを自動適用で実行</description>
      </command>
    </category>
    
    <category name="database">
      <command>
        <execute>bunx drizzle-kit push</execute>
        <description>Tursoにスキーマ変更をプッシュ</description>
      </command>
      <command>
        <execute>bunx drizzle-kit generate</execute>
        <description>マイグレーション生成</description>
      </command>
      <command>
        <execute>bunx drizzle-kit migrate</execute>
        <description>マイグレーション適用</description>
      </command>
      <command>
        <execute>bunx @better-auth/cli generate</execute>
        <description>Better Authスキーマ生成</description>
      </command>
    </category>
    
    <category name="turso-branching">
      <command>
        <execute>turso db create new-db --from-db old-db</execute>
        <description>既存データベースから新しいブランチを作成</description>
      </command>
      <command>
        <execute>turso db destroy new-db</execute>
        <description>不要になったブランチを手動で削除</description>
      </command>
    </category>
  </development-commands>

  <architecture-overview>
    <description>Next.js 15とReact 19を使用した工数管理・レポートシステム（App Router使用）</description>
    
    <technology-stack>
      <technology category="framework">
        <name>Next.js with React Compiler</name>
        <status>実験的機能</status>
      </technology>
      <technology category="package-manager">
        <name>Bun</name>
        <note>npm/yarnは使用しない</note>
      </technology>
      <technology category="styling">
        <name>Tailwind CSS</name>
        <features>Intent UIコンポーネント</features>
      </technology>
      <technology category="state-management">
        <server-state>TanStack Query</server-state>
        <url-state>nuqs</url-state>
      </technology>
      <technology category="backend">
        <name>Hono</name>
        <purpose>バックエンドフレームワーク</purpose>
      </technology>
      <technology category="api">
        <name>up-fetch</name>
        <features>fetch拡張ライブラリ</features>
      </technology>
      <technology category="database">
        <name>Drizzle with Turso</name>
        <purpose>ORM (エッジSQLite)</purpose>
      </technology>
      <technology category="auth">
        <name>Better Auth</name>
        <features>passkey対応</features>
      </technology>
      <technology category="form">
        <name>Conform</name>
        <purpose>form管理ライブラリ</purpose>
      </technology>
      <technology category="code-quality">
        <name>Biome</name>
        <note>ESLint/Prettierは使用しない</note>
      </technology>
      <technology category="validation">
        <name>Zod</name>
        <purpose>バリデーションスキーマ定義</purpose>
      </technology>
      <technology category="utility">
        <name>Remeda</name>
        <purpose>TypeScriptのユーティリティライブラリ</purpose>
      </technology>
      <technology category="date">
        <name>date-fns</name>
        <purpose>日付操作ライブラリ</purpose>
      </technology>
      <technology category="ui">
        <name>TanStack Table</name>
        <purpose>Unstyled UI tableライブラリ</purpose>
      </technology>
      <technology category="virtualization">
        <name>React Virtuoso</name>
        <purpose>仮想化レンダリングライブラリ</purpose>
      </technology>
      <technology category="dialog">
        <name>react-call</name>
        <purpose>Confirmダイアログ管理ライブラリ</purpose>
      </technology>
    </technology-stack>
    
    <directory-structure pattern="Bulletproof React">
      <directory path="/nextjs-suama">
        <directory path="public" description="画像などアセット類"/>
        <directory path="src">
          <directory path="app" description="ルーティング定義">
            <directory path="(auth)" description="認証関連ページ">
              <directory path="forgot-password"/>
              <directory path="reset-password"/>
              <directory path="sign-in"/>
              <directory path="sign-up"/>
            </directory>
            <directory path="(protected)" description="認証必須ページ">
              <directory path="(reports)" description="レポート機能">
                <directory path="daily"/>
                <directory path="weekly"/>
              </directory>
              <directory path="(reports-contexts)" description="レポートコンテキスト管理">
                <directory path="appeal"/>
                <directory path="client"/>
                <directory path="mission"/>
                <directory path="project"/>
                <directory path="trouble"/>
              </directory>
              <directory path="(user)" description="ユーザー管理"/>
            </directory>
            <directory path="api" description="Route Handler">
              <directory path="[[...route]]" description="optional catch-all segmentsによるAPIルート">
                <file path="route.ts" description="HonoのAPI Route定義"/>
              </directory>
              <directory path="auth">
                <directory path="[...all]"/>
              </directory>
            </directory>
            <file path="layout.tsx" description="ルートレイアウト"/>
            <file path="page.tsx" description="ルートページコンポーネント"/>
            <file path="loading.tsx" description="ルートローディングUI"/>
            <file path="error.tsx" description="ルートエラーページ（グローバルエラーページ）"/>
            <file path="not-found.tsx" description="404ページ"/>
            <file path="unauthorized.tsx" description="401ページ"/>
            <file path="forbidden.tsx" description="403ページ"/>
            <file path="globals.css" description="グローバルスタイル"/>
            <file path="favicon.ico" description="ファビコン"/>
          </directory>
          <directory path="components" description="アプリ全体で使われるコンポーネント実装">
            <directory path="providers" description="アプリ全体で使われるProvider群">
              <file path="nuqs-provider.tsx" description="nuqsのadapterを提供する"/>
              <file path="query-provider.tsx" description="tanstack-queryのQueryClientを提供する"/>
              <file path="*-provider.tsx" description="その他、任意のProvider"/>
            </directory>
            <directory path="ui" description="プロジェクト全体で使用するコンポーネント格納ディレクトリ">
              <directory path="intent-ui" description="Intent UIのコンポーネントを格納するディレクトリ">
                <file path="button.tsx" description="Intent UIのButton"/>
                <file path="input.tsx" description="Intent UIのInput"/>
                <file path="card.tsx" description="Intent UIのCard"/>
                <file path="***" description="その他のIntent UIのコンポーネント"/>
              </directory>
              <directory path="sidebar" description="サイドバー関連コンポーネント"/>
              <directory path="pagination" description="ページネーション関連コンポーネント"/>
            </directory>
          </directory>
          <directory path="features" description="当該ルーティングにおける機能実装">
            <directory path="auth" description="認証機能">
              <directory path="actions" description="server actionsを格納（server actionsは原則1ファイル（モジュール）1関数としてください）"/>
              <directory path="components" description="認証機能のコンポーネント"/>
              <directory path="types">
                <directory path="schemas" description="zod schemaをまとめるディレクトリ"/>
              </directory>
            </directory>
            <directory path="report-contexts" description="レポートコンテキスト管理機能">
              <directory path="appeals"/>
              <directory path="clients"/>
              <directory path="missions"/>
              <directory path="projects"/>
              <directory path="troubles"/>
              <directory path="components" description="共通コンポーネント"/>
              <directory path="types">
                <directory path="search-params" description="nuqsのsearch paramsの型定義をまとめるディレクトリ"/>
              </directory>
              <directory path="utils"/>
            </directory>
            <directory path="reports" description="レポート機能">
              <directory path="daily"/>
              <directory path="weekly"/>
              <directory path="components" description="共通コンポーネント"/>
            </directory>
            <directory path="users" description="ユーザー管理機能">
              <directory path="actions" description="server actionsを格納"/>
              <directory path="api" description="API関連の処理を格納">
                <file path="route.ts" description="APIの実装を行うファイル"/>
              </directory>
              <directory path="components" description="当該機能で使用するコンポーネントをまとめるディレクトリ"/>
              <directory path="server" description="サーバー側フェッチング"/>
              <directory path="types" description="当該機能で使用する型定義をまとめるディレクトリ">
                <directory path="schemas" description="zod schemaをまとめるディレクトリ"/>
                <directory path="search-params" description="nuqsのsearch paramsの型定義をまとめるディレクトリ"/>
              </directory>
              <directory path="utils" description="当該機能で使用するユーティリティ定義をまとめるディレクトリ"/>
            </directory>
          </directory>
          <file path="middleware.ts" description="ミドルウェア実装（https://nextjs.org/docs/app/building-your-application/routing/middleware）"/>
          <directory path="types" description="アプリ全体で使われる型定義">
            <directory path="search-params"/>
            <file path="*.ts" description="任意の型定義"/>
          </directory>
          <directory path="constants" description="アプリ全体で使われる定数"/>
          <directory path="db">
            <file path="schema.ts" description="テーブルSchema定義"/>
          </directory>
          <directory path="hooks" description="アプリ全体で使われるカスタムフック(use-***.ts)"/>
          <directory path="lib" description="アプリ全体で使用されるライブラリの設定定義や共通ヘルパー関数"/>
          <file path="env.ts" description="@t3-oss/env-nextjs による環境変数定義"/>
          <file path="index.ts" description="Drizzle ORM のDB定義"/>
          <directory path="utils" description="アプリ全体で使われるユーティリティ実装"/>
        </directory>
        <file path=".env.*" description="環境変数定義ファイル"/>
        <file path="next.config.ts" description="next.jsの設定ファイル"/>
        <file path="intentui.json" description="Intent UIの設定ファイル"/>
        <file path="tailwind.config.ts" description="tailwind cssの設定ファイル"/>
        <file path="postcss.config.mjs" description="postcssの設定ファイル（主にtailwind cssのプラグイン設定を記述）"/>
        <file path="package.json" description="パッケージマネージャーの設定ファイル"/>
        <file path="biome.json" description="Linter・Formatterの設定ファイル"/>
        <file path="tsconfig.json" description="typescriptの設定ファイル"/>
        <file path="drizzle.config.ts" description="drizzleの設定ファイル"/>
        <file path="auth-schema.ts" description="Better Authのスキーマ定義"/>
      </directory>
    </directory-structure>
  </architecture-overview>

  <development-guidelines>
    <core-principles priority="high">
      <principle>Next.js App Routerパターンに従い、サーバー/クライアントコンポーネントの境界を適切に設定</principle>
      <principle>React Compilerを使用（手動でのuseMemo/useCallbackは避ける）</principle>
      <principle>「use client」ディレクティブは境界コンポーネントにのみ適用し、クライアントモジュールグラフを最小化</principle>
      <principle>AHAプログラミングに従う（性急な抽象化を避ける）</principle>
      <principle>データフェッチングのコロケーション：RequestMemoizationを使用してリーフコンポーネントでフェッチ</principle>
      <principle>routingの機能および、Suspenseを活用し、適切なチャンク化を行うこと</principle>
      <principle>slotsの概念やComposition Patternを活用し、Client Module Graphを小さくし、Clientに送信されるJSバンドルを小さくすること（RSC内に移せる記述は移し、Server Module Graphを大きくする方針とする）</principle>
    </core-principles>
    
    <naming-conventions>
      <convention target="files-and-folders">kebab-case（動的ルートの[id]を除く）</convention>
      <convention target="variables-and-functions">camelCase</convention>
      <convention target="function-definitions">関数宣言を使用：export default async function componentName() {}</convention>
    </naming-conventions>
    
    <data-fetching-strategy>
      <strategy>RequestMemorizationおよび、並列フェッチ・preloadを活用しデータフェッチのウォーターフォールを避けること</strategy>
      <strategy>データフェッチはデータフェッチ コロケーションに従い、末端のリーフコンポーネントで行うこと</strategy>
      <strategy>fetchには`src/lib/fetcher.ts`にてfetch関数を拡張した関数を使用すること</strategy>
      <strategy>使用時は、HonoのRPCによる機能を使用し、urlと`InferResponseType`などで型安全なfetchを実現すること</strategy>
      <strategy>Server Actionsはミューテーションのみ（クライアントコンポーネントでのフェッチ代替として使用しない）</strategy>
      <strategy>React.cacheとNext.jsキャッシュタグによるキャッシュ管理</strategy>
    </data-fetching-strategy>
    
    <cache-strategy>
      <strategy>React.cacheやNext.jsの`use cache`を宣言し、適宜、`cacheTag`・`cacheLife`を使用し、On-demand Cacheとすること</strategy>
    </cache-strategy>
    
    <server-actions-guidelines>
      <guideline>Mutationの処理のみに使用してください</guideline>
      <guideline>絶対にClient Componentでfetchの代替に使用しないでください（左記を実装する場合、tanstack-queryやSWRなどのClient Fetch Libraryの導入を検討してください）</guideline>
      <guideline>with-callbackによるハンドリングを可能な限り使用すること</guideline>
    </server-actions-guidelines>
    
    <code-quality-requirements>
      <requirement type="TypeScript">strictモードを有効化</requirement>
      <requirement type="path-mapping">インポートには~/を使用（./src/*）</requirement>
      <requirement type="biome-configuration">インデント2スペース、JSにはシングルクォート</requirement>
      <requirement type="build-verification">PR前に実装者は`bun run build`または`bun run build:clean`を実行し、ビルドが通ることを確認すること</requirement>
      <requirement type="database-development">開発でDBに変更が必要な場合は、Tursoの「ブランチング」機能を活用し、環境を切り替えること</requirement>
    </code-quality-requirements>
    
    <component-architecture>
      <guideline>コンポーネント戦略は[AHA Programming](https://kentcdodds.com/blog/aha-programming)に従い、性急な抽象化は避けた設計を行うこと</guideline>
      <guideline>ディレクトリ戦略は[bulletproof-react](https://github.com/alan2207/bulletproof-react)に従い、実装すること</guideline>
      <guideline>propsなど、個々人の記述に差異がでないよう関数宣言を使用してください（例: export default async function sample() {}）</guideline>
    </component-architecture>
    
    <api-integration>
      <guideline>src/lib/fetcher.tsの拡張fetch関数を使用したRPC型安全なAPI呼び出し</guideline>
      <guideline>HonoのRPCによる`InferResponseType`を使用した型定義</guideline>
      <guideline>ランタイム型チェックのためのZodバリデーション</guideline>
      <guideline>@t3-oss/env-nextjsを使用した環境変数バリデーション</guideline>
    </api-integration>
    
    <performance-considerations>
      <consideration>React Compilerがメモ化を自動的に処理（本プロジェクトでは使用しているため、原則、`useMemo`や`useCallback`などのメモ化のhooksは不要）</consideration>
      <consideration>可能な限りサーバーコンポーネントを使用</consideration>
      <consideration>適切なエラー境界を実装</consideration>
      <consideration>共有可能な状態のためのURL駆動状態管理（nuqs使用）</consideration>
    </performance-considerations>
  </development-guidelines>

  <environment-variables>
    <variable>
      <name>NEXT_PUBLIC_APP_URL</name>
      <value>http://localhost:3000</value>
    </variable>
    <variable>
      <name>TURSO_DATABASE_URL</name>
      <value>{NotePMにて共有}</value>
    </variable>
    <variable>
      <name>TURSO_AUTH_TOKEN</name>
      <value>{NotePMにて共有}</value>
    </variable>
    <variable>
      <name>BETTER_AUTH_SECRET</name>
      <value>openssl rand -base64 32</value>
    </variable>
    <variable>
      <name>BETTER_AUTH_URL</name>
      <value>http://localhost:3000</value>
    </variable>
  </environment-variables>

  <additional-information-files>
    <file path="README.md" description="プロジェクトのコーディング規約、ディレクトリ構成、禁止事項"/>
  </additional-information-files>

  <ai-assistant-instructions priority="high">
    <instruction priority="1">このプロジェクトではテストは導入していないため、テスト関連の作業は不要</instruction>
    <instruction priority="2">TypeScriptの型安全性を最優先する</instruction>
    <instruction priority="3">セキュリティベストプラクティスに従う</instruction>
    <instruction priority="4">パフォーマンスを常に考慮する</instruction>
    <instruction priority="5">コードコメントは日本語で記述</instruction>
    <instruction priority="6">実装前に必ず設計を確認する</instruction>
  </ai-assistant-instructions>

  <prohibited-items priority="highest">
    <prohibition>any型の過剰使用（可能な限りTypeScriptのUtility型を使用する）</prohibition>
    <prohibition>console.logの本番環境残存</prohibition>
    <prohibition>セキュリティキーの直接記述</prohibition>
    <prohibition>npm/yarnの使用（bunのみ使用）</prohibition>
    <prohibition>手動メモ化（useMemo/useCallback）の使用</prohibition>
    <prohibition>Client ComponentでのServer Actions代替フェッチ使用</prohibition>
  </prohibited-items>

  <chat-output-format>
    <format>
      <section>[AI運用6原則]</section>
      <section>[main_output]</section>
      <section>#[n] times. # n = 各チャットでインクリメント（#1, #2...）</section>
    </format>
  </chat-output-format>
</project-guidance>