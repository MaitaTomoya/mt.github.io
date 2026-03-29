/**
 * タイピングゲームの問題データ
 * 4つのモード（通常タイピング、日本語タイピング、Vim操作、Macショートカット）の
 * 問題データとローマ字変換テーブルを提供する
 */

// ---------------------------------------------------------------------------
// ローマ字→ひらがな変換テーブル
// ---------------------------------------------------------------------------

/** ローマ字→ひらがな変換テーブル（各ひらがなに対して許容される入力パターンの配列） */
export const ROMAJI_TABLE: { [kana: string]: string[] } = {
  // 母音
  あ: ['a'],
  い: ['i'],
  う: ['u'],
  え: ['e'],
  お: ['o'],

  // か行
  か: ['ka', 'ca'],
  き: ['ki'],
  く: ['ku', 'cu', 'qu'],
  け: ['ke'],
  こ: ['ko', 'co'],

  // さ行
  さ: ['sa'],
  し: ['si', 'shi', 'ci'],
  す: ['su'],
  せ: ['se', 'ce'],
  そ: ['so'],

  // た行
  た: ['ta'],
  ち: ['ti', 'chi'],
  つ: ['tu', 'tsu'],
  て: ['te'],
  と: ['to'],

  // な行
  な: ['na'],
  に: ['ni'],
  ぬ: ['nu'],
  ね: ['ne'],
  の: ['no'],

  // は行
  は: ['ha'],
  ひ: ['hi'],
  ふ: ['hu', 'fu'],
  へ: ['he'],
  ほ: ['ho'],

  // ま行
  ま: ['ma'],
  み: ['mi'],
  む: ['mu'],
  め: ['me'],
  も: ['mo'],

  // や行
  や: ['ya'],
  ゆ: ['yu'],
  よ: ['yo'],

  // ら行
  ら: ['ra', 'la'],
  り: ['ri', 'li'],
  る: ['ru', 'lu'],
  れ: ['re', 'le'],
  ろ: ['ro', 'lo'],

  // わ行
  わ: ['wa'],
  ゐ: ['wi'],
  ゑ: ['we'],
  を: ['wo'],

  // ん（nn で確定、子音の前では n でも可）
  ん: ['nn', 'xn'],

  // 濁音 が行
  が: ['ga'],
  ぎ: ['gi'],
  ぐ: ['gu'],
  げ: ['ge'],
  ご: ['go'],

  // 濁音 ざ行
  ざ: ['za'],
  じ: ['zi', 'ji'],
  ず: ['zu'],
  ぜ: ['ze'],
  ぞ: ['zo'],

  // 濁音 だ行
  だ: ['da'],
  ぢ: ['di'],
  づ: ['du', 'dzu'],
  で: ['de'],
  ど: ['do'],

  // 濁音 ば行
  ば: ['ba'],
  び: ['bi'],
  ぶ: ['bu'],
  べ: ['be'],
  ぼ: ['bo'],

  // 半濁音 ぱ行
  ぱ: ['pa'],
  ぴ: ['pi'],
  ぷ: ['pu'],
  ぺ: ['pe'],
  ぽ: ['po'],

  // 拗音 きゃ行
  きゃ: ['kya'],
  きゅ: ['kyu'],
  きょ: ['kyo'],

  // 拗音 しゃ行
  しゃ: ['sya', 'sha'],
  しゅ: ['syu', 'shu'],
  しょ: ['syo', 'sho'],

  // 拗音 ちゃ行
  ちゃ: ['tya', 'cha', 'cya'],
  ちゅ: ['tyu', 'chu', 'cyu'],
  ちょ: ['tyo', 'cho', 'cyo'],

  // 拗音 にゃ行
  にゃ: ['nya'],
  にゅ: ['nyu'],
  にょ: ['nyo'],

  // 拗音 ひゃ行
  ひゃ: ['hya'],
  ひゅ: ['hyu'],
  ひょ: ['hyo'],

  // 拗音 みゃ行
  みゃ: ['mya'],
  みゅ: ['myu'],
  みょ: ['myo'],

  // 拗音 りゃ行
  りゃ: ['rya', 'lya'],
  りゅ: ['ryu', 'lyu'],
  りょ: ['ryo', 'lyo'],

  // 拗音 ぎゃ行
  ぎゃ: ['gya'],
  ぎゅ: ['gyu'],
  ぎょ: ['gyo'],

  // 拗音 じゃ行
  じゃ: ['ja', 'zya', 'jya'],
  じゅ: ['ju', 'zyu', 'jyu'],
  じょ: ['jo', 'zyo', 'jyo'],

  // 拗音 びゃ行
  びゃ: ['bya'],
  びゅ: ['byu'],
  びょ: ['byo'],

  // 拗音 ぴゃ行
  ぴゃ: ['pya'],
  ぴゅ: ['pyu'],
  ぴょ: ['pyo'],

  // 拗音 でゃ行
  でゃ: ['dha', 'dya'],
  でゅ: ['dhu', 'dyu'],
  でょ: ['dho', 'dyo'],

  // 小文字（捨て仮名）
  ぁ: ['xa', 'la'],
  ぃ: ['xi', 'li'],
  ぅ: ['xu', 'lu'],
  ぇ: ['xe', 'le'],
  ぉ: ['xo', 'lo'],
  っ: ['xtu', 'xtsu', 'ltu', 'ltsu'],
  ゃ: ['xya', 'lya'],
  ゅ: ['xyu', 'lyu'],
  ょ: ['xyo', 'lyo'],
  ゎ: ['xwa', 'lwa'],

  // 特殊な拗音（ティ、ディなど外来語表記）
  てぃ: ['thi'],
  でぃ: ['dhi'],
  ふぁ: ['fa'],
  ふぃ: ['fi'],
  ふぇ: ['fe'],
  ふぉ: ['fo'],
  うぃ: ['whi'],
  うぇ: ['whe'],
  うぉ: ['who'],

  // 促音（っ）は次の子音を重ねて入力する
  // 例: 「かった」→ katta, 「きって」→ kitte
  // これはロジック側で処理するが、単体の っ も登録しておく

  // 長音符
  ー: ['-'],
}

/**
 * 促音（っ）の処理ヒント
 * っ + 子音の場合、子音を2回入力する（例: った → tta）
 * ロジック側で ROMAJI_TABLE と組み合わせて処理する想定
 */
export const SOKUON_CONSONANTS = [
  'k',
  's',
  't',
  'n',
  'h',
  'm',
  'r',
  'w',
  'g',
  'z',
  'd',
  'b',
  'p',
  'c',
  'f',
  'j',
  'v',
]

// ---------------------------------------------------------------------------
// 通常タイピング問題データ（英語/コード）
// ---------------------------------------------------------------------------

/** 通常タイピング問題の型定義 */
export interface TypingQuestion {
  /** お題テキスト */
  text: string
  /** カテゴリ名 */
  category: string
}

/** 通常タイピング問題データ（難易度別） */
export const normalQuestions: {
  easy: TypingQuestion[]
  medium: TypingQuestion[]
  hard: TypingQuestion[]
} = {
  easy: [
    { text: 'const', category: 'JavaScript' },
    { text: 'function', category: 'JavaScript' },
    { text: 'import', category: 'JavaScript' },
    { text: 'return', category: 'JavaScript' },
    { text: 'async', category: 'JavaScript' },
    { text: 'await', category: 'JavaScript' },
    { text: 'class', category: 'JavaScript' },
    { text: 'interface', category: 'TypeScript' },
    { text: 'export', category: 'JavaScript' },
    { text: 'default', category: 'JavaScript' },
    { text: 'static', category: 'JavaScript' },
    { text: 'private', category: 'TypeScript' },
    { text: 'public', category: 'TypeScript' },
    { text: 'void', category: 'TypeScript' },
    { text: 'string', category: 'TypeScript' },
    { text: 'number', category: 'TypeScript' },
    { text: 'boolean', category: 'TypeScript' },
    { text: 'null', category: 'JavaScript' },
    { text: 'undefined', category: 'JavaScript' },
    { text: 'true', category: 'JavaScript' },
    { text: 'false', category: 'JavaScript' },
    { text: 'break', category: 'JavaScript' },
    { text: 'continue', category: 'JavaScript' },
    { text: 'switch', category: 'JavaScript' },
    { text: 'case', category: 'JavaScript' },
    { text: 'throw', category: 'JavaScript' },
    { text: 'catch', category: 'JavaScript' },
    { text: 'try', category: 'JavaScript' },
    { text: 'finally', category: 'JavaScript' },
    { text: 'while', category: 'JavaScript' },
    { text: 'typeof', category: 'JavaScript' },
    { text: 'extends', category: 'JavaScript' },
    { text: 'super', category: 'JavaScript' },
    { text: 'yield', category: 'JavaScript' },
    { text: 'delete', category: 'JavaScript' },
  ],
  medium: [
    { text: 'const app = express()', category: 'Express' },
    { text: "import React from 'react'", category: 'React' },
    { text: 'git commit -m "fix"', category: 'Git' },
    { text: 'npm install express', category: 'npm' },
    { text: 'docker compose up -d', category: 'Docker' },
    { text: "console.log('hello')", category: 'JavaScript' },
    { text: 'useState(false)', category: 'React' },
    { text: 'export default function', category: 'JavaScript' },
    { text: 'const [data, setData]', category: 'React' },
    { text: 'async function fetchData()', category: 'JavaScript' },
    { text: "router.get('/api')", category: 'Express' },
    { text: 'res.status(200).json()', category: 'Express' },
    { text: 'try { } catch (e) { }', category: 'JavaScript' },
    { text: 'if (err) throw err', category: 'JavaScript' },
    { text: 'process.env.PORT || 3000', category: 'Node.js' },
    { text: 'const { data } = await res.json()', category: 'JavaScript' },
    { text: "document.getElementById('app')", category: 'DOM' },
    { text: 'Array.from({ length: 10 })', category: 'JavaScript' },
    { text: 'Object.keys(config).map()', category: 'JavaScript' },
    { text: 'git push origin main', category: 'Git' },
    { text: 'npm run build && npm start', category: 'npm' },
    { text: 'const ref = useRef(null)', category: 'React' },
    { text: "fetch('/api/users')", category: 'JavaScript' },
    { text: 'Promise.all([p1, p2, p3])', category: 'JavaScript' },
    { text: 'interface Props { children: ReactNode }', category: 'TypeScript' },
    { text: 'type Status = "active" | "inactive"', category: 'TypeScript' },
  ],
  hard: [
    {
      text: 'const handler = async (req: Request, res: Response) => {}',
      category: 'Express',
    },
    {
      text: "import { useState, useEffect } from 'react'",
      category: 'React',
    },
    {
      text: 'const result = await prisma.user.findMany({ where: { active: true } })',
      category: 'Prisma',
    },
    {
      text: 'export const GET = async (request: NextRequest) => {}',
      category: 'Next.js',
    },
    {
      text: "const router = createBrowserRouter([{ path: '/', element: <App /> }])",
      category: 'React Router',
    },
    {
      text: 'const [isPending, startTransition] = useTransition()',
      category: 'React',
    },
    {
      text: "app.use(cors({ origin: 'http://localhost:3000', credentials: true }))",
      category: 'Express',
    },
    {
      text: 'const schema = z.object({ name: z.string().min(1), age: z.number() })',
      category: 'Zod',
    },
    {
      text: "const { data, error } = useSWR('/api/user', fetcher)",
      category: 'SWR',
    },
    {
      text: 'export default function Layout({ children }: { children: React.ReactNode }) {}',
      category: 'Next.js',
    },
    {
      text: 'const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)',
      category: 'Supabase',
    },
    {
      text: "describe('UserService', () => { it('should create user', async () => {}) })",
      category: 'テスト',
    },
    {
      text: 'const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60000 } } })',
      category: 'TanStack Query',
    },
    {
      text: 'const middleware = (req: NextRequest) => NextResponse.redirect(new URL("/login", req.url))',
      category: 'Next.js',
    },
    {
      text: 'type ApiResponse<T> = { success: boolean; data: T; error?: string }',
      category: 'TypeScript',
    },
    {
      text: 'docker run -d -p 3000:3000 --env-file .env --name app my-image:latest',
      category: 'Docker',
    },
    {
      text: "const socket = new WebSocket('wss://api.example.com/ws')",
      category: 'WebSocket',
    },
    {
      text: "await db.insert(users).values({ name: 'John', email: 'john@example.com' }).returning()",
      category: 'Drizzle',
    },
    {
      text: 'const formData = new FormData(); formData.append("file", blob, "image.png")',
      category: 'JavaScript',
    },
    {
      text: 'useEffect(() => { const controller = new AbortController(); return () => controller.abort() }, [])',
      category: 'React',
    },
  ],
}

// ---------------------------------------------------------------------------
// 日本語タイピング問題データ
// ---------------------------------------------------------------------------

/** 日本語タイピング問題の型定義 */
export interface JapaneseQuestion {
  /** 日本語テキスト（表示用） */
  text: string
  /** ひらがな読み */
  reading: string
  /** カテゴリ */
  category: string
}

/** 日本語タイピング問題データ（難易度別） */
export const japaneseQuestions: {
  easy: JapaneseQuestion[]
  medium: JapaneseQuestion[]
  hard: JapaneseQuestion[]
} = {
  easy: [
    { text: 'ユーザー情報', reading: 'ゆーざーじょうほう', category: 'コメント' },
    { text: 'バグを修正', reading: 'ばぐをしゅうせい', category: 'コミット' },
    { text: 'デプロイ完了', reading: 'でぷろいかんりょう', category: 'チャット' },
    { text: 'テスト追加', reading: 'てすとついか', category: 'コミット' },
    { text: 'コンポーネント', reading: 'こんぽーねんと', category: '用語' },
    { text: '画面遷移', reading: 'がめんせんい', category: '用語' },
    { text: '初期設定', reading: 'しょきせってい', category: '用語' },
    { text: '環境構築', reading: 'かんきょうこうちく', category: '用語' },
    { text: 'コード修正', reading: 'こーどしゅうせい', category: 'コミット' },
    { text: '型定義', reading: 'かたていぎ', category: '用語' },
    { text: 'レビュー依頼', reading: 'れびゅーいらい', category: 'チャット' },
    { text: 'マージ完了', reading: 'まーじかんりょう', category: 'チャット' },
    { text: '機能追加', reading: 'きのうついか', category: 'コミット' },
    { text: 'エラー修正', reading: 'えらーしゅうせい', category: 'コミット' },
    { text: 'データ取得', reading: 'でーたしゅとく', category: 'コメント' },
    { text: '配列操作', reading: 'はいれつそうさ', category: '用語' },
    { text: '変数宣言', reading: 'へんすうせんげん', category: '用語' },
    { text: '関数定義', reading: 'かんすうていぎ', category: '用語' },
    { text: '条件分岐', reading: 'じょうけんぶんき', category: '用語' },
    { text: 'ループ処理', reading: 'るーぷしょり', category: '用語' },
    { text: '非同期処理', reading: 'ひどうきしょり', category: '用語' },
    { text: '状態管理', reading: 'じょうたいかんり', category: '用語' },
    { text: 'プルリクエスト', reading: 'ぷるりくえすと', category: '用語' },
    { text: 'ブランチ作成', reading: 'ぶらんちさくせい', category: 'Git' },
    { text: 'コミットメッセージ', reading: 'こみっとめっせーじ', category: 'Git' },
    { text: 'サーバー起動', reading: 'さーばーきどう', category: 'コマンド' },
    { text: 'ビルド成功', reading: 'びるどせいこう', category: 'チャット' },
  ],
  medium: [
    {
      text: 'ログイン機能を実装する',
      reading: 'ろぐいんきのうをじっそうする',
      category: 'コメント',
    },
    { text: '検索結果を表示する', reading: 'けんさくけっかをひょうじする', category: 'コメント' },
    {
      text: '入力値のバリデーション',
      reading: 'にゅうりょくちのばりでーしょん',
      category: 'コメント',
    },
    { text: 'データベースに保存する', reading: 'でーたべーすにほぞんする', category: 'コメント' },
    { text: 'ページネーションを追加', reading: 'ぺーじねーしょんをついか', category: 'コミット' },
    {
      text: '認証トークンを検証する',
      reading: 'にんしょうとーくんをけんしょうする',
      category: 'コメント',
    },
    { text: 'リファクタリングを実施', reading: 'りふぁくたりんぐをじっし', category: 'コミット' },
    {
      text: 'エラーハンドリングを追加',
      reading: 'えらーはんどりんぐをついか',
      category: 'コミット',
    },
    {
      text: 'レスポンシブデザインに対応',
      reading: 'れすぽんしぶでざいんにたいおう',
      category: 'コミット',
    },
    {
      text: 'ユニットテストを作成する',
      reading: 'ゆにっとてすとをさくせいする',
      category: 'コメント',
    },
    {
      text: 'コンポーネントを分割する',
      reading: 'こんぽーねんとをぶんかつする',
      category: 'コメント',
    },
    { text: 'パフォーマンスを最適化', reading: 'ぱふぉーまんすをさいてきか', category: 'コミット' },
    {
      text: '依存パッケージを更新する',
      reading: 'いぞんぱっけーじをこうしんする',
      category: 'コミット',
    },
    { text: '型安全を確保する', reading: 'かたあんぜんをかくほする', category: 'コメント' },
    { text: 'ステート管理を見直す', reading: 'すてーとかんりをみなおす', category: 'コメント' },
    {
      text: '環境変数を設定する',
      reading: 'かんきょうへんすうをせっていする',
      category: 'コメント',
    },
    { text: 'アクセシビリティ対応', reading: 'あくせしびりてぃたいおう', category: 'コミット' },
    {
      text: 'セキュリティ対策を強化',
      reading: 'せきゅりてぃたいさくをきょうか',
      category: 'コミット',
    },
    { text: 'マイグレーションを実行', reading: 'まいぐれーしょんをじっこう', category: 'コマンド' },
    {
      text: 'キャッシュ戦略を検討する',
      reading: 'きゃっしゅせんりゃくをけんとうする',
      category: 'コメント',
    },
  ],
  hard: [
    {
      text: 'パフォーマンス改善のためキャッシュを導入しました',
      reading: 'ぱふぉーまんすかいぜんのためきゃっしゅをどうにゅうしました',
      category: 'PR',
    },
    {
      text: '認証フローをリファクタリングしてセキュリティを向上',
      reading: 'にんしょうふろーをりふぁくたりんぐしてせきゅりてぃをこうじょう',
      category: 'PR',
    },
    {
      text: 'レスポンスタイムが大幅に改善されることを確認しました',
      reading: 'れすぽんすたいむがおおはばにかいぜんされることをかくにんしました',
      category: 'レビュー',
    },
    {
      text: 'データベースのインデックスを追加してクエリを最適化',
      reading: 'でーたべーすのいんでっくすをついかしてくえりをさいてきか',
      category: 'PR',
    },
    {
      text: 'コンポーネントの責務を分離してテスタビリティを向上させる',
      reading: 'こんぽーねんとのせきむをぶんりしててすたびりてぃをこうじょうさせる',
      category: 'レビュー',
    },
    {
      text: 'エラーバウンダリを設置してユーザー体験を改善しました',
      reading: 'えらーばうんだりをせっちしてゆーざーたいけんをかいぜんしました',
      category: 'PR',
    },
    {
      text: 'サーバーサイドレンダリングを導入してパフォーマンスを向上',
      reading: 'さーばーさいどれんだりんぐをどうにゅうしてぱふぉーまんすをこうじょう',
      category: 'PR',
    },
    {
      text: 'ミドルウェアで認証チェックを一元化しました',
      reading: 'みどるうぇあでにんしょうちぇっくをいちげんかしました',
      category: 'PR',
    },
    {
      text: '並行処理のレースコンディションを修正しました',
      reading: 'へいこうしょりのれーすこんでぃしょんをしゅうせいしました',
      category: 'PR',
    },
    {
      text: 'コードカバレッジを向上させるためテストケースを追加',
      reading: 'こーどかばれっじをこうじょうさせるためてすとけーすをついか',
      category: 'レビュー',
    },
    {
      text: 'バンドルサイズを削減するため動的インポートを導入',
      reading: 'ばんどるさいずをさくげんするためどうてきいんぽーとをどうにゅう',
      category: 'PR',
    },
    {
      text: 'マイクロサービス間の通信をグラフキューエルに移行',
      reading: 'まいくろさーびすかんのつうしんをぐらふきゅーえるにいこう',
      category: 'PR',
    },
    {
      text: 'アクセシビリティ監査の結果に基づいて改修を実施しました',
      reading: 'あくせしびりてぃかんさのけっかにもとづいてかいしゅうをじっししました',
      category: 'PR',
    },
    {
      text: 'デッドコードを削除してバンドルサイズを最適化しました',
      reading: 'でっどこーどをさくじょしてばんどるさいずをさいてきかしました',
      category: 'コミット',
    },
    {
      text: 'リトライロジックを追加してネットワーク障害に対応',
      reading: 'りとらいろじっくをついかしてねっとわーくしょうがいにたいおう',
      category: 'PR',
    },
  ],
}

// ---------------------------------------------------------------------------
// Vim操作問題データ
// ---------------------------------------------------------------------------

/** Vim操作問題の型定義 */
export interface VimQuestion {
  /** 指示文（日本語） */
  instruction: string
  /** 正解キー入力（複数パターン許容） */
  keys: string[]
  /** カテゴリ */
  category: string
  /** 難易度 */
  difficulty: 'easy' | 'medium' | 'hard'
}

/** Vim操作問題データ */
export const vimQuestions: VimQuestion[] = [
  // --- 基本移動（easy） ---
  { instruction: 'カーソルを左に移動', keys: ['h'], category: '移動', difficulty: 'easy' },
  { instruction: 'カーソルを下に移動', keys: ['j'], category: '移動', difficulty: 'easy' },
  { instruction: 'カーソルを上に移動', keys: ['k'], category: '移動', difficulty: 'easy' },
  { instruction: 'カーソルを右に移動', keys: ['l'], category: '移動', difficulty: 'easy' },
  { instruction: '行頭に移動', keys: ['0', '^'], category: '移動', difficulty: 'easy' },
  { instruction: '行末に移動', keys: ['$'], category: '移動', difficulty: 'easy' },
  { instruction: '次の単語の先頭に移動', keys: ['w'], category: '移動', difficulty: 'easy' },
  { instruction: '前の単語の先頭に移動', keys: ['b'], category: '移動', difficulty: 'easy' },
  { instruction: '単語の末尾に移動', keys: ['e'], category: '移動', difficulty: 'easy' },
  { instruction: 'ファイルの先頭に移動', keys: ['gg'], category: '移動', difficulty: 'easy' },
  { instruction: 'ファイルの末尾に移動', keys: ['G'], category: '移動', difficulty: 'easy' },

  // --- 挿入モード（easy） ---
  { instruction: 'カーソル位置の前に挿入', keys: ['i'], category: '挿入', difficulty: 'easy' },
  { instruction: '行頭に挿入', keys: ['I'], category: '挿入', difficulty: 'easy' },
  { instruction: 'カーソル位置の後に挿入', keys: ['a'], category: '挿入', difficulty: 'easy' },
  { instruction: '行末に挿入', keys: ['A'], category: '挿入', difficulty: 'easy' },
  { instruction: '下に新しい行を挿入', keys: ['o'], category: '挿入', difficulty: 'easy' },
  { instruction: '上に新しい行を挿入', keys: ['O'], category: '挿入', difficulty: 'easy' },

  // --- 削除（medium） ---
  { instruction: 'カーソル位置の1文字を削除', keys: ['x'], category: '削除', difficulty: 'easy' },
  { instruction: '1単語を削除', keys: ['dw'], category: '削除', difficulty: 'medium' },
  { instruction: '現在の行を削除', keys: ['dd'], category: '削除', difficulty: 'medium' },
  {
    instruction: 'カーソルから行末まで削除',
    keys: ['D', 'd$'],
    category: '削除',
    difficulty: 'medium',
  },

  // --- コピー/ペースト（medium） ---
  {
    instruction: '現在の行をコピー（ヤンク）',
    keys: ['yy'],
    category: 'コピー',
    difficulty: 'medium',
  },
  { instruction: 'カーソルの後にペースト', keys: ['p'], category: 'コピー', difficulty: 'medium' },
  { instruction: 'カーソルの前にペースト', keys: ['P'], category: 'コピー', difficulty: 'medium' },

  // --- 検索（medium） ---
  { instruction: '前方検索を開始', keys: ['/'], category: '検索', difficulty: 'medium' },
  { instruction: '次の検索結果に移動', keys: ['n'], category: '検索', difficulty: 'medium' },
  { instruction: '前の検索結果に移動', keys: ['N'], category: '検索', difficulty: 'medium' },

  // --- 元に戻す/やり直し（medium） ---
  { instruction: '元に戻す（アンドゥ）', keys: ['u'], category: '編集', difficulty: 'medium' },
  { instruction: 'やり直す（リドゥ）', keys: ['Ctrl+r'], category: '編集', difficulty: 'medium' },

  // --- 保存/終了（medium） ---
  { instruction: 'ファイルを保存', keys: [':w'], category: '保存/終了', difficulty: 'medium' },
  { instruction: 'ファイルを閉じる', keys: [':q'], category: '保存/終了', difficulty: 'medium' },
  {
    instruction: '保存して閉じる',
    keys: [':wq', 'ZZ'],
    category: '保存/終了',
    difficulty: 'medium',
  },
  { instruction: '保存せずに強制終了', keys: [':q!'], category: '保存/終了', difficulty: 'medium' },

  // --- 組み合わせ操作（hard） ---
  { instruction: '3行下に移動', keys: ['3j'], category: '移動', difficulty: 'hard' },
  { instruction: '5行上に移動', keys: ['5k'], category: '移動', difficulty: 'hard' },
  { instruction: '3単語を削除', keys: ['d3w', '3dw'], category: '削除', difficulty: 'hard' },
  { instruction: '2行を削除', keys: ['2dd'], category: '削除', difficulty: 'hard' },
  {
    instruction: 'ダブルクオート内のテキストを変更',
    keys: ['ci"'],
    category: '編集',
    difficulty: 'hard',
  },
  {
    instruction: '括弧とその中身を削除',
    keys: ['ca(', 'ca)', 'cab'],
    category: '編集',
    difficulty: 'hard',
  },
  { instruction: '単語を変更（内側のみ）', keys: ['ciw'], category: '編集', difficulty: 'hard' },
  { instruction: '単語を削除（内側のみ）', keys: ['diw'], category: '削除', difficulty: 'hard' },
  { instruction: 'ビジュアルモードに入る', keys: ['v'], category: '選択', difficulty: 'hard' },
  {
    instruction: '行単位のビジュアルモードに入る',
    keys: ['V'],
    category: '選択',
    difficulty: 'hard',
  },
  {
    instruction: 'ブロックビジュアルモードに入る',
    keys: ['Ctrl+v'],
    category: '選択',
    difficulty: 'hard',
  },
  { instruction: '対応する括弧に移動', keys: ['%'], category: '移動', difficulty: 'hard' },
  { instruction: '現在行のインデントを追加', keys: ['>>'], category: '編集', difficulty: 'hard' },
  { instruction: '現在行のインデントを削除', keys: ['<<'], category: '編集', difficulty: 'hard' },
  { instruction: '直前の操作を繰り返す', keys: ['.'], category: '編集', difficulty: 'hard' },
  {
    instruction: '指定行にジャンプ（例: 42行目）',
    keys: ['42G', ':42'],
    category: '移動',
    difficulty: 'hard',
  },
]

// ---------------------------------------------------------------------------
// Macショートカット問題データ
// ---------------------------------------------------------------------------

/** Macショートカット問題の型定義 */
export interface MacShortcutQuestion {
  /** 指示文 */
  instruction: string
  /** 正解キーの組み合わせ（複数パターン） */
  keys: { key: string; ctrl?: boolean; meta?: boolean; alt?: boolean; shift?: boolean }[]
  /** 表示用キー文字列 */
  displayKeys: string[]
  /** カテゴリ */
  category: string
  /** 難易度 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** ブラウザでキャプチャ可能か */
  canCapture: boolean
}

/** Macショートカット問題データ */
export const macShortcutQuestions: MacShortcutQuestion[] = [
  // --- 基本操作（easy） ---
  {
    instruction: 'コピー',
    keys: [{ key: 'c', meta: true }],
    displayKeys: ['Cmd+C'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: 'ペースト',
    keys: [{ key: 'v', meta: true }],
    displayKeys: ['Cmd+V'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '切り取り',
    keys: [{ key: 'x', meta: true }],
    displayKeys: ['Cmd+X'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '元に戻す',
    keys: [{ key: 'z', meta: true }],
    displayKeys: ['Cmd+Z'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: 'やり直す',
    keys: [{ key: 'z', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+Z'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '全て選択',
    keys: [{ key: 'a', meta: true }],
    displayKeys: ['Cmd+A'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '保存',
    keys: [{ key: 's', meta: true }],
    displayKeys: ['Cmd+S'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '検索',
    keys: [{ key: 'f', meta: true }],
    displayKeys: ['Cmd+F'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '新規タブを開く',
    keys: [{ key: 't', meta: true }],
    displayKeys: ['Cmd+T'],
    category: 'ブラウザ',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '印刷',
    keys: [{ key: 'p', meta: true }],
    displayKeys: ['Cmd+P'],
    category: '基本',
    difficulty: 'easy',
    canCapture: true,
  },

  // --- テキスト編集（easy/medium） ---
  {
    instruction: '行末に移動',
    keys: [{ key: 'e', ctrl: true }],
    displayKeys: ['Ctrl+E'],
    category: 'テキスト編集',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: '行頭に移動',
    keys: [{ key: 'a', ctrl: true }],
    displayKeys: ['Ctrl+A'],
    category: 'テキスト編集',
    difficulty: 'easy',
    canCapture: true,
  },
  {
    instruction: 'カーソルから行末まで削除',
    keys: [{ key: 'k', ctrl: true }],
    displayKeys: ['Ctrl+K'],
    category: 'テキスト編集',
    difficulty: 'medium',
    canCapture: true,
  },

  // --- ブラウザ操作（medium） ---
  {
    instruction: 'ページを再読み込み',
    keys: [{ key: 'r', meta: true }],
    displayKeys: ['Cmd+R'],
    category: 'ブラウザ',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: 'キャッシュをクリアして再読み込み',
    keys: [{ key: 'r', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+R'],
    category: 'ブラウザ',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: 'アドレスバーにフォーカス',
    keys: [{ key: 'l', meta: true }],
    displayKeys: ['Cmd+L'],
    category: 'ブラウザ',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: '開発者ツールを開く',
    keys: [{ key: 'i', meta: true, alt: true }],
    displayKeys: ['Cmd+Option+I'],
    category: 'ブラウザ',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: '閉じたタブを復元',
    keys: [{ key: 't', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+T'],
    category: 'ブラウザ',
    difficulty: 'medium',
    canCapture: true,
  },

  // --- VSCode操作（medium） ---
  {
    instruction: 'コマンドパレットを開く',
    keys: [{ key: 'p', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+P'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: 'ファイルをクイックオープン',
    keys: [{ key: 'p', meta: true }],
    displayKeys: ['Cmd+P'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: 'ターミナルを開く/閉じる',
    keys: [{ key: '`', ctrl: true }],
    displayKeys: ['Ctrl+`'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: '行をコメントアウト',
    keys: [{ key: '/', meta: true }],
    displayKeys: ['Cmd+/'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: '行を上下に移動',
    keys: [
      { key: 'ArrowUp', alt: true },
      { key: 'ArrowDown', alt: true },
    ],
    displayKeys: ['Option+Up', 'Option+Down'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },
  {
    instruction: 'サイドバーの表示/非表示',
    keys: [{ key: 'b', meta: true }],
    displayKeys: ['Cmd+B'],
    category: 'VSCode',
    difficulty: 'medium',
    canCapture: true,
  },

  // --- システム操作（medium/hard、一部キャプチャ不可） ---
  {
    instruction: 'アプリケーションを切り替え',
    keys: [{ key: 'Tab', meta: true }],
    displayKeys: ['Cmd+Tab'],
    category: 'システム',
    difficulty: 'medium',
    canCapture: false,
  },
  {
    instruction: 'ウィンドウを閉じる',
    keys: [{ key: 'w', meta: true }],
    displayKeys: ['Cmd+W'],
    category: 'システム',
    difficulty: 'easy',
    canCapture: false,
  },
  {
    instruction: 'アプリケーションを終了',
    keys: [{ key: 'q', meta: true }],
    displayKeys: ['Cmd+Q'],
    category: 'システム',
    difficulty: 'easy',
    canCapture: false,
  },
  {
    instruction: 'アプリケーションを隠す',
    keys: [{ key: 'h', meta: true }],
    displayKeys: ['Cmd+H'],
    category: 'システム',
    difficulty: 'medium',
    canCapture: false,
  },
  {
    instruction: 'ウィンドウを最小化',
    keys: [{ key: 'm', meta: true }],
    displayKeys: ['Cmd+M'],
    category: 'システム',
    difficulty: 'medium',
    canCapture: false,
  },
  {
    instruction: 'スクリーンショット（全画面）',
    keys: [{ key: '3', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+3'],
    category: 'システム',
    difficulty: 'medium',
    canCapture: false,
  },
  {
    instruction: 'スクリーンショット（範囲選択）',
    keys: [{ key: '4', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+4'],
    category: 'システム',
    difficulty: 'medium',
    canCapture: false,
  },
  {
    instruction: 'Spotlight検索',
    keys: [{ key: 'Space', meta: true }],
    displayKeys: ['Cmd+Space'],
    category: 'システム',
    difficulty: 'easy',
    canCapture: false,
  },

  // --- 高度な操作（hard） ---
  {
    instruction: '文字を太字にする',
    keys: [{ key: 'b', meta: true }],
    displayKeys: ['Cmd+B'],
    category: 'テキスト編集',
    difficulty: 'hard',
    canCapture: true,
  },
  {
    instruction: '置換',
    keys: [{ key: 'h', meta: true, alt: true }],
    displayKeys: ['Cmd+Option+H'],
    category: 'VSCode',
    difficulty: 'hard',
    canCapture: true,
  },
  {
    instruction: 'マルチカーソルを追加',
    keys: [{ key: 'd', meta: true }],
    displayKeys: ['Cmd+D'],
    category: 'VSCode',
    difficulty: 'hard',
    canCapture: true,
  },
  {
    instruction: '全ての出現箇所を選択',
    keys: [{ key: 'l', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+L'],
    category: 'VSCode',
    difficulty: 'hard',
    canCapture: true,
  },
  {
    instruction: '定義へジャンプ',
    keys: [{ key: 'F12' }],
    displayKeys: ['F12'],
    category: 'VSCode',
    difficulty: 'hard',
    canCapture: true,
  },
  {
    instruction: '強制再読み込み（キャッシュ無視）',
    keys: [{ key: 'r', meta: true, shift: true }],
    displayKeys: ['Cmd+Shift+R'],
    category: 'ブラウザ',
    difficulty: 'hard',
    canCapture: true,
  },
]
