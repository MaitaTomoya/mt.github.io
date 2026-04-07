# エンジニア向けキーボード入力練習

## 1. 括弧系（最頻出）

```
const user = { name: "Tomoya", age: 28 };
const items = [1, 2, 3].map((x) => x * 2);
function greet(name: string): string { return `Hello, ${name}!`; }
if (arr.length > 0) { console.log(arr[0]); }
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

## 2. アロー・比較演算子

```
const add = (a: number, b: number) => a + b;
const isValid = score >= 80 && score <= 100;
if (a !== b || c < d) { return a > b ? a : b; }
const pipeline = data |> filter |> map |> reduce;
users.forEach((u) => { if (u.age >= 18) { console.log(u.name); } });
```

## 3. テンプレートリテラル・文字列操作

```
const url = `https://api.example.com/users/${userId}?page=${page}&limit=20`;
const query = `SELECT * FROM users WHERE name = '${name}' AND age >= ${age}`;
const path = `/home/${user}/.config/settings.json`;
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
console.log(`結果: ${items.length}件 (${Math.round(rate * 100)}%)`);
```

## 4. オブジェクト・分割代入

```
const { name, age, ...rest } = user;
const config = { ...defaultConfig, ...userConfig, debug: true };
const [first, second, ...others] = items;
const key = `prefix_${Date.now()}`;
const obj = { [key]: value, "content-type": "application/json" };
```

## 5. 型定義（TypeScript）

```
interface User {
  id: number;
  name: string;
  email?: string;
  roles: ("admin" | "editor" | "viewer")[];
  metadata: Record<string, unknown>;
}
type ApiResponse<T> = Promise<{ data: T; status: number }>;
const handler: (req: Request, res: Response) => void = async (req, res) => {};
```

## 6. コマンドライン・シェル

```
cat package.json | jq '.dependencies | keys[]'
find . -name "*.ts" -not -path "./node_modules/*" | xargs wc -l
git log --oneline --graph --all | head -20
docker run -d -p 3000:3000 -e NODE_ENV=production --name app my-image:latest
curl -s -H "Authorization: Bearer ${TOKEN}" https://api.example.com/v1/users | jq '.'
echo "Hello, World!" >> output.txt && cat output.txt
ls -la ~/.ssh/ | grep "id_"
tar -czf backup_$(date +%Y%m%d).tar.gz ./src/ ./public/
export PATH="$HOME/.local/bin:$PATH"
ssh -i ~/.ssh/id_ed25519 -p 2222 user@192.168.1.100
```

## 7. 正規表現

```
const phoneRegex = /^0\d{1,4}-\d{1,4}-\d{4}$/;
const urlRegex = /https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+/;
const csvLine = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

## 8. JSON / 設定ファイル

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

## 9. SQL

```sql
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id
WHERE u.created_at >= '2026-01-01'
  AND u.status IN ('active', 'premium')
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 20 OFFSET 0;
```

## 10. CSS / Tailwind

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: clamp(1rem, 3vw, 2rem);
}

@media (max-width: 768px) {
  .container > *:nth-child(n + 4) {
    display: none;
  }
}
```

```html
<div class="flex items-center gap-2 rounded-lg bg-gray-100/80 px-4 py-2 hover:bg-gray-200/90">
  <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
</div>
```

## 11. Git / GitHub

```
git commit -m "feat(auth): OAuth2.0 PKCE対応を追加 (#123)"
git rebase -i HEAD~3
git diff --stat origin/main...HEAD
git stash push -m "WIP: ユーザー認証の修正" -- src/auth/*.ts
git log --pretty=format:"%h %an <%ae> %s" --since="2026-03-01"
```

## 12. 環境変数・dotenv

```
DATABASE_URL="postgresql://user:p@ssw0rd!@localhost:5432/mydb?schema=public"
REDIS_URL="redis://:secret@127.0.0.1:6379/0"
NEXT_PUBLIC_API_URL=https://api.example.com/v2
JWT_SECRET=my$uper$ecret_key_2026!@#
AWS_S3_BUCKET=my-app-assets-${NODE_ENV:-development}
```

## 13. 日本語混じりの実務コメント・ログ

```typescript
// TODO(tomoya): 認証トークンの有効期限チェックを追加する (#456)
// FIXME: 全角スペース混入で「name」が一致しない問題
// NOTE: この処理は O(n^2) だが、n <= 100 なので許容範囲
console.error(`[${new Date().toISOString()}] エラー: ユーザー(id=${userId})の取得に失敗`)
throw new Error(`不正な入力値: expected 0~100, got ${value}`)
// 参考: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
```

## 練習のコツ

- まずはゆっくり正確に打つことを優先する
- 特に `{}` `[]` `()` `<>` の4種の括弧を迷わず打てるようにする
- バッククォート `` ` `` とシングルクォート `'` の打ち分けを意識する
- `|`（パイプ）、`\`（バックスラッシュ）、`~`（チルダ）の位置を体に覚えさせる
- `=>` `===` `!==` `&&` `||` `?.` `??` などの複合記号を流れで打てるようにする
