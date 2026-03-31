---
title: 'Linux基礎'
order: 21
section: 'キャッシュ/システム'
---

# Linux基礎

## Linuxとは何か

Linuxは、世界中のサーバーの大多数で使われている**オープンソースのオペレーティングシステム（OS）**。正確にはLinuxは**カーネル**（OSの中核部分）の名前であり、カーネルに様々なソフトウェアを組み合わせたものを**ディストリビューション**と呼ぶ。

### OS、カーネル、ディストリビューションの関係

人間の体に例えると:

| 用語                   | 役割                                                                             | 体に例えると                   |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| カーネル               | ハードウェアとソフトウェアの橋渡し。メモリ管理、プロセス管理、デバイス管理を行う | 脳幹（生命維持に不可欠な部分） |
| シェル                 | ユーザーの命令をカーネルに伝えるインターフェース                                 | 口（命令を伝える）             |
| ユーティリティ         | ls、cp、grepなどの基本コマンド群                                                 | 手足（具体的な作業をする）     |
| ディストリビューション | カーネル + シェル + ユーティリティ + パッケージマネージャ等をまとめたもの        | 体全体                         |

### Linuxカーネルの誕生

1991年にフィンランドの大学生リーナス・トーバルズが開発を始めた。GNUプロジェクト（リチャード・ストールマン）が開発していたツール群と組み合わさり、完全なOSとして機能するようになった。そのため正式には「GNU/Linux」と呼ばれることもある。

## なぜエンジニアにLinuxが必要か

### サーバーの大半がLinux

Webサービスを動かすサーバーの**90%以上がLinux**で動いている。AWSやGCPなどのクラウドサービスのサーバーも基本的にLinux。つまり、Webエンジニアがサーバーを扱う以上、Linuxの知識は避けて通れない。

### Dockerの基盤

Dockerコンテナの中身はLinux。Dockerfileを書くときにLinuxコマンドを使う。コンテナ内でのデバッグにもLinuxの知識が必要。

```dockerfile
# DockerfileはLinuxコマンドの塊
FROM node:20-alpine
RUN apk add --no-cache curl     # alpineのパッケージマネージャ
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### クラウドでの必須スキル

| 場面                 | 使うLinuxスキル   |
| -------------------- | ----------------- |
| サーバーにSSH接続    | ssh、鍵認証       |
| ログの調査           | tail、grep、less  |
| プロセスの確認       | ps、top、kill     |
| ファイルの確認・編集 | ls、cat、vi       |
| デプロイ作業         | scp、rsync、chmod |
| 環境変数の設定       | export、.bashrc   |
| 定期実行の設定       | cron              |
| サービスの管理       | systemctl         |

## ディストリビューション一覧

### 主要ディストリビューション比較表

| ディストリビューション | ベース | パッケージマネージャ | 用途                  | 特徴                              |
| ---------------------- | ------ | -------------------- | --------------------- | --------------------------------- |
| Ubuntu                 | Debian | apt                  | デスクトップ/サーバー | 初心者向け。情報が多い。LTS版あり |
| Debian                 | -      | apt                  | サーバー              | 安定性重視。Ubuntuの元            |
| CentOS / Rocky Linux   | RHEL   | yum/dnf              | サーバー              | 企業向け。RHEL互換                |
| Amazon Linux           | RHEL系 | yum/dnf              | AWS                   | AWSに最適化                       |
| Alpine Linux           | -      | apk                  | Docker                | 超軽量（5MB）。Dockerで人気       |
| Arch Linux             | -      | pacman               | デスクトップ          | 最新パッケージ。上級者向け        |

### どれを使うべきか

- **初めてLinuxを学ぶ**: Ubuntu（情報が最も多い）
- **Dockerで使う**: Alpine（イメージが小さい）
- **AWSで使う**: Amazon Linux 2023
- **企業のサーバー**: Ubuntu LTS または Rocky Linux

## ファイルシステム

Linuxでは全てがファイルとして扱われる。ディレクトリ（フォルダ）もファイルの一種。全てのファイルは`/`（ルート）を起点としたツリー構造で管理される。

### 主要ディレクトリ構造

```
/                     ルートディレクトリ（全ての起点）
├── bin/              基本コマンド（ls, cp, mvなど）
├── boot/             起動に必要なファイル
├── dev/              デバイスファイル
├── etc/              設定ファイル（etcetera の略）
│   ├── nginx/        Nginxの設定
│   ├── ssh/          SSHの設定
│   └── crontab       cronの設定
├── home/             ユーザーのホームディレクトリ
│   └── username/     各ユーザーのホーム
├── lib/              共有ライブラリ
├── opt/              追加ソフトウェア
├── proc/             プロセス情報（仮想ファイルシステム）
├── root/             rootユーザーのホーム
├── sbin/             システム管理用コマンド
├── tmp/              一時ファイル（再起動で消える）
├── usr/              ユーザー用プログラム
│   ├── bin/          一般ユーザー用コマンド
│   ├── lib/          ライブラリ
│   └── local/        ローカルインストールしたソフト
└── var/              変動するデータ
    ├── log/          ログファイル
    ├── www/          Webサーバーのドキュメント
    └── tmp/          永続的な一時ファイル
```

### 覚えておくべきディレクトリ

| ディレクトリ | 役割                 | 実務での使用場面                |
| ------------ | -------------------- | ------------------------------- |
| `/etc`       | 設定ファイル         | Nginx、MySQL、SSHなどの設定変更 |
| `/home`      | ユーザーデータ       | 自分の作業ディレクトリ          |
| `/var/log`   | ログ                 | エラー調査、アクセスログ確認    |
| `/tmp`       | 一時ファイル         | ビルド中間ファイル、テンポラリ  |
| `/usr/local` | ローカルインストール | 手動インストールしたソフト      |
| `/opt`       | オプションソフト     | サードパーティアプリケーション  |

### WindowsとLinuxのパスの違い

| 項目         | Windows                 | Linux               |
| ------------ | ----------------------- | ------------------- |
| 区切り文字   | `\`（バックスラッシュ） | `/`（スラッシュ）   |
| ルート       | `C:\`                   | `/`                 |
| ホーム       | `C:\Users\username`     | `/home/username`    |
| 大文字小文字 | 区別しない              | 区別する            |
| 隠しファイル | 属性で管理              | `.`で始まるファイル |

## 基本コマンド

### ファイル・ディレクトリ操作

#### ls - ファイル一覧を表示

```bash
ls                    # カレントディレクトリの内容を表示
ls -l                 # 詳細表示（パーミッション、所有者、サイズ、更新日時）
ls -a                 # 隠しファイル（.で始まるファイル）も表示
ls -la                # 詳細 + 隠しファイル
ls -lh                # サイズを人間が読みやすい形式で（KB, MB, GB）
ls -lt                # 更新日時順にソート
ls -lS                # ファイルサイズ順にソート
ls -R                 # サブディレクトリも再帰的に表示
```

`ls -la`の出力の読み方:

```
drwxr-xr-x  5 taro  staff  160  3月 28 10:00 myproject
-rw-r--r--  1 taro  staff  1234  3月 28 09:30 index.js
```

| 部分           | 意味                        |
| -------------- | --------------------------- |
| `d` / `-`      | ディレクトリ / 通常ファイル |
| `rwxr-xr-x`    | パーミッション（後述）      |
| `5` / `1`      | ハードリンク数              |
| `taro`         | 所有者                      |
| `staff`        | グループ                    |
| `160` / `1234` | サイズ（バイト）            |
| `3月 28 10:00` | 最終更新日時                |
| `myproject`    | ファイル名/ディレクトリ名   |

#### cd - ディレクトリの移動

```bash
cd /home/taro          # 絶対パスで移動
cd myproject           # 相対パスで移動
cd ..                  # 1つ上のディレクトリへ
cd ../..               # 2つ上のディレクトリへ
cd ~                   # ホームディレクトリへ（cd だけでも同じ）
cd -                   # 直前のディレクトリへ（行ったり来たりに便利）
```

#### pwd - 現在のディレクトリを表示

```bash
pwd
# /home/taro/myproject
```

#### mkdir - ディレクトリの作成

```bash
mkdir mydir            # ディレクトリを作成
mkdir -p a/b/c         # 中間ディレクトリも一括作成
mkdir -p src/{components,utils,hooks}  # 複数ディレクトリを一括作成
```

#### rmdir - 空のディレクトリを削除

```bash
rmdir empty_dir        # 空のディレクトリを削除（中身があるとエラー）
```

#### cp - ファイルのコピー

```bash
cp file.txt copy.txt           # ファイルをコピー
cp -r mydir/ backup/           # ディレクトリごと再帰的にコピー
cp -i file.txt dest/           # 上書き前に確認（interactive）
cp -p file.txt dest/           # パーミッションと日時を保持
cp file1.txt file2.txt dest/   # 複数ファイルをコピー
```

#### mv - ファイルの移動/名前変更

```bash
mv old.txt new.txt             # 名前変更
mv file.txt /home/taro/docs/   # ファイルを移動
mv -i file.txt dest/           # 上書き前に確認
mv mydir/ /opt/                # ディレクトリを移動
```

#### rm - ファイルの削除

```bash
rm file.txt                    # ファイルを削除
rm -r mydir/                   # ディレクトリごと削除（recursive）
rm -f file.txt                 # 確認なしで強制削除（force）
rm -rf mydir/                  # ディレクトリを確認なしで強制削除
rm -i file.txt                 # 削除前に確認
```

**注意**: `rm -rf /`は絶対に実行しないこと。システム全体が消える。`rm`はゴミ箱に入るのではなく、完全に削除される。

#### cat - ファイル内容の表示

```bash
cat file.txt                   # ファイル全体を表示
cat -n file.txt                # 行番号付きで表示
cat file1.txt file2.txt        # 複数ファイルを連結して表示
cat file1.txt file2.txt > merged.txt  # 連結して別ファイルに出力
```

#### less - ページ単位でファイルを閲覧

```bash
less largefile.log
# 操作:
#   スペース / f : 次のページ
#   b           : 前のページ
#   /検索語     : 前方検索
#   ?検索語     : 後方検索
#   n           : 次の検索結果
#   N           : 前の検索結果
#   g           : ファイルの先頭
#   G           : ファイルの末尾
#   q           : 終了
```

#### head / tail - ファイルの先頭/末尾を表示

```bash
head file.txt                  # 先頭10行を表示
head -n 20 file.txt            # 先頭20行を表示
head -n 5 file.txt             # 先頭5行を表示

tail file.txt                  # 末尾10行を表示
tail -n 20 file.txt            # 末尾20行を表示
tail -f /var/log/syslog        # リアルタイムで新しい行を監視（ログ監視）
tail -f -n 100 app.log         # 最新100行を表示してから監視を開始
```

`tail -f`はログのリアルタイム監視で最もよく使うコマンドの1つ。Ctrl+Cで停止する。

#### find - ファイルの検索

```bash
find . -name "*.js"                    # カレント以下の.jsファイルを検索
find . -name "*.log" -mtime -7         # 7日以内に更新された.logファイル
find . -type d -name "node_modules"    # node_modulesディレクトリを検索
find . -size +100M                     # 100MB以上のファイルを検索
find . -name "*.tmp" -delete           # .tmpファイルを検索して削除
find /var/log -name "*.log" -mtime +30 # 30日以上前のログファイル
find . -type f -empty                  # 空のファイルを検索
find . -perm 777                       # パーミッション777のファイル
```

#### grep - テキスト検索

```bash
grep "error" app.log                   # "error"を含む行を表示
grep -i "error" app.log                # 大文字小文字を区別しない
grep -n "error" app.log                # 行番号付きで表示
grep -r "TODO" ./src/                  # ディレクトリ内を再帰的に検索
grep -c "error" app.log                # マッチした行数を表示
grep -v "debug" app.log                # "debug"を含まない行を表示
grep -l "error" *.log                  # マッチしたファイル名だけ表示
grep -A 3 "error" app.log             # マッチ行の後3行も表示
grep -B 2 "error" app.log             # マッチ行の前2行も表示
grep -C 2 "error" app.log             # マッチ行の前後2行を表示
grep -E "error|warning" app.log        # 正規表現（error または warning）
```

#### wc - 行数/単語数/バイト数のカウント

```bash
wc file.txt                    # 行数 単語数 バイト数 を表示
wc -l file.txt                 # 行数だけ表示
wc -w file.txt                 # 単語数だけ表示
wc -c file.txt                 # バイト数だけ表示
```

### コマンドの組み合わせ例

```bash
# ファイル数をカウント
ls -l | wc -l

# ログからエラー行数を数える
grep -c "ERROR" /var/log/app.log

# 大きいファイルトップ10
du -sh * | sort -rh | head -10

# 特定の拡張子のファイルを全て探す
find . -name "*.ts" -not -path "*/node_modules/*" | wc -l
```

## ファイル権限

Linuxでは全てのファイルに「誰が何をできるか」を定義するパーミッション（権限）がある。

### パーミッションの読み方

```
-rwxr-xr--
```

| 位置       | 文字  | 意味                                                                         |
| ---------- | ----- | ---------------------------------------------------------------------------- |
| 1文字目    | `-`   | ファイルタイプ（`-`:通常ファイル、`d`:ディレクトリ、`l`:シンボリックリンク） |
| 2-4文字目  | `rwx` | 所有者（Owner）の権限                                                        |
| 5-7文字目  | `r-x` | グループ（Group）の権限                                                      |
| 8-10文字目 | `r--` | その他（Others）の権限                                                       |

### rwxの意味

| 文字           | 意味     | ファイルの場合             | ディレクトリの場合                 |
| -------------- | -------- | -------------------------- | ---------------------------------- |
| `r`（read）    | 読み取り | ファイルの内容を読める     | ディレクトリの中身を一覧表示できる |
| `w`（write）   | 書き込み | ファイルの内容を変更できる | ファイルの作成・削除ができる       |
| `x`（execute） | 実行     | プログラムとして実行できる | ディレクトリに移動（cd）できる     |
| `-`            | 権限なし | -                          | -                                  |

### 数字表記（8進数）

パーミッションは数字でも表現できる。各権限に数値が割り当てられている。

| 権限          | 数値 |
| ------------- | ---- |
| r（読み取り） | 4    |
| w（書き込み） | 2    |
| x（実行）     | 1    |
| なし          | 0    |

これらを足し合わせる:

| 数字 | 権限 | 意味                       |
| ---- | ---- | -------------------------- |
| 7    | rwx  | 読み取り + 書き込み + 実行 |
| 6    | rw-  | 読み取り + 書き込み        |
| 5    | r-x  | 読み取り + 実行            |
| 4    | r--  | 読み取りのみ               |
| 3    | -wx  | 書き込み + 実行            |
| 2    | -w-  | 書き込みのみ               |
| 1    | --x  | 実行のみ                   |
| 0    | ---  | 権限なし                   |

### よく使うパーミッション

| 数字 | パーミッション | 用途                                     |
| ---- | -------------- | ---------------------------------------- |
| 755  | rwxr-xr-x      | ディレクトリ、実行ファイル               |
| 644  | rw-r--r--      | 通常のファイル                           |
| 600  | rw-------      | 秘密鍵など、所有者のみ読み書き           |
| 700  | rwx------      | 所有者のみフルアクセス                   |
| 777  | rwxrwxrwx      | 全員フルアクセス（セキュリティリスク大） |

### chmod - パーミッションの変更

```bash
# 数字表記
chmod 755 script.sh            # rwxr-xr-x
chmod 644 config.txt           # rw-r--r--
chmod 600 ~/.ssh/id_rsa        # rw------- （SSH秘密鍵は600必須）

# 記号表記
chmod +x script.sh             # 実行権限を追加
chmod u+w file.txt             # 所有者に書き込み権限を追加
chmod g-w file.txt             # グループから書き込み権限を削除
chmod o-rwx file.txt           # その他から全権限を削除
chmod -R 755 mydir/            # ディレクトリ以下を再帰的に変更
```

記号表記の構文: `[対象][操作][権限]`

| 対象 | 意味              |
| ---- | ----------------- |
| u    | 所有者（user）    |
| g    | グループ（group） |
| o    | その他（others）  |
| a    | 全員（all）       |

| 操作 | 意味                 |
| ---- | -------------------- |
| +    | 権限を追加           |
| -    | 権限を削除           |
| =    | 権限を設定（上書き） |

### chown - 所有者の変更

```bash
chown taro file.txt            # 所有者を変更
chown taro:staff file.txt      # 所有者とグループを変更
chown -R taro:staff mydir/     # 再帰的に変更
```

## ユーザーとグループ

### ユーザーの種類

| ユーザー         | 説明                                     | UID      |
| ---------------- | ---------------------------------------- | -------- |
| root             | スーパーユーザー。何でもできる           | 0        |
| 一般ユーザー     | 制限された権限を持つ                     | 1000以上 |
| システムユーザー | サービス用のユーザー（nginx、mysqlなど） | 1-999    |

### sudo

`sudo`は一般ユーザーがroot権限でコマンドを実行するための仕組み。

```bash
# rootとして実行
sudo apt update
sudo systemctl restart nginx

# rootユーザーに切り替え（非推奨）
sudo su -

# 現在のユーザーを確認
whoami

# ユーザー情報を表示
id
# uid=1000(taro) gid=1000(taro) groups=1000(taro),27(sudo)
```

### ユーザー管理コマンド

```bash
# ユーザーの追加
sudo useradd -m -s /bin/bash newuser  # -m: ホームディレクトリ作成、-s: デフォルトシェル

# パスワードの設定
sudo passwd newuser

# ユーザーの変更
sudo usermod -aG docker newuser       # dockerグループに追加（-a: 追加、-G: グループ指定）

# グループの確認
groups newuser

# ユーザーの削除
sudo userdel -r olduser               # -r: ホームディレクトリも削除
```

## パイプとリダイレクト

### パイプ（|）

コマンドの出力を次のコマンドの入力に渡す仕組み。Linuxの最も強力な機能の1つ。

```bash
# lsの結果からファイル名で絞り込み
ls -la | grep ".js"

# プロセス一覧からnginxを探す
ps aux | grep nginx

# ログのエラー行数を数える
cat /var/log/app.log | grep "ERROR" | wc -l

# ファイルの行数順にソートしてトップ5
find . -name "*.ts" -exec wc -l {} \; | sort -rn | head -5

# パイプを3つ以上つなげる
cat access.log | grep "POST" | grep "api" | sort | uniq -c | sort -rn | head -10
```

水道管に例えると分かりやすい。前のコマンドの出力が水として流れ、次のコマンドのフィルターを通って次々と加工される。

### リダイレクト

コマンドの出力をファイルに保存したり、ファイルからの入力を与えたりする仕組み。

| 記号        | 意味                               | 例                         |
| ----------- | ---------------------------------- | -------------------------- |
| `>`         | 出力をファイルに書き込み（上書き） | `echo "hello" > file.txt`  |
| `>>`        | 出力をファイルに追記               | `echo "world" >> file.txt` |
| `<`         | ファイルの内容を入力として与える   | `wc -l < file.txt`         |
| `2>`        | エラー出力をファイルに書き込み     | `command 2> error.log`     |
| `2>&1`      | エラー出力を標準出力にまとめる     | `command > all.log 2>&1`   |
| `/dev/null` | 出力を捨てる（ゴミ箱）             | `command > /dev/null 2>&1` |

```bash
# コマンドの結果をファイルに保存
ls -la > filelist.txt

# ログの検索結果をファイルに保存
grep "ERROR" app.log > errors.txt

# エラー出力だけをファイルに保存
find / -name "config" 2> /dev/null     # エラーメッセージを捨てる

# 標準出力とエラー出力の両方をファイルに保存
command > output.log 2>&1

# ファイルの内容をコマンドに渡す
sort < unsorted.txt > sorted.txt
```

### 標準入出力の図解

```
              ┌──────────────────────┐
  stdin  (0) →│                      │→ stdout (1)  → 画面 or ファイル
              │      コマンド         │
              │                      │→ stderr (2)  → 画面 or ファイル
              └──────────────────────┘
```

- **stdin（標準入力）**: 数字0。キーボード入力やファイルからの入力
- **stdout（標準出力）**: 数字1。正常な出力結果
- **stderr（標準エラー出力）**: 数字2。エラーメッセージ

## テキスト処理

Linuxでのテキスト処理は、ログ解析やデータ加工で頻繁に使う。

### grep - パターン検索（再掲 + 応用）

```bash
# 基本的な使い方は前述の通り

# 実用例: アクセスログから特定のIPアドレスを抽出
grep "192.168.1.100" access.log

# 実用例: エラーログからタイムスタンプ付きで抽出
grep -E "2024-03-2[0-9].*ERROR" app.log

# 実用例: 設定ファイルからコメント行を除外
grep -v "^#" /etc/nginx/nginx.conf | grep -v "^$"
```

### sed - テキストの置換・変換

sed（Stream Editor）は、テキストの置換や削除を行うコマンド。

```bash
# 基本的な置換（各行の最初のマッチ）
sed 's/old/new/' file.txt

# 全てのマッチを置換（gフラグ）
sed 's/old/new/g' file.txt

# ファイルを直接編集（-i オプション）
sed -i 's/old/new/g' file.txt

# 特定の行だけ置換
sed '3s/old/new/' file.txt           # 3行目だけ
sed '1,5s/old/new/g' file.txt       # 1-5行目

# 行の削除
sed '5d' file.txt                    # 5行目を削除
sed '/^#/d' file.txt                # コメント行を削除
sed '/^$/d' file.txt                # 空行を削除

# 実用例: 設定ファイルのポート番号を変更
sed -i 's/port=8080/port=3000/g' config.txt

# 実用例: HTMLタグを除去
sed 's/<[^>]*>//g' page.html
```

### awk - テキストのフィールド処理

awkは、テキストを列（フィールド）単位で処理する強力なコマンド。

```bash
# スペース区切りの2列目を表示
awk '{print $2}' file.txt

# 区切り文字を指定（CSVなど）
awk -F',' '{print $1, $3}' data.csv

# 条件付き表示
awk '$3 > 100 {print $1, $3}' data.txt    # 3列目が100より大きい行

# 計算
awk '{sum += $1} END {print "合計:", sum}' numbers.txt

# 実用例: ディスク使用率が80%以上のパーティション
df -h | awk '$5 > 80 {print $1, $5}'

# 実用例: アクセスログからIPアドレスの出現回数
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10
```

### sort, uniq, cut, tr

```bash
# sort - ソート
sort file.txt                  # 辞書順ソート
sort -n file.txt               # 数値順ソート
sort -r file.txt               # 逆順ソート
sort -k2 file.txt              # 2列目でソート
sort -t',' -k3 -n data.csv     # CSV形式、3列目を数値でソート

# uniq - 重複の除去（事前にsortが必要）
sort file.txt | uniq           # 重複行を除去
sort file.txt | uniq -c        # 出現回数を表示
sort file.txt | uniq -d        # 重複している行だけ表示

# cut - フィールドの切り出し
cut -d',' -f1,3 data.csv      # CSV形式の1列目と3列目
cut -c1-10 file.txt            # 各行の1-10文字目
echo "2024-03-28" | cut -d'-' -f2   # 03

# tr - 文字の変換・削除
echo "Hello World" | tr 'A-Z' 'a-z'   # 小文字に変換
echo "hello world" | tr 'a-z' 'A-Z'   # 大文字に変換
echo "hello   world" | tr -s ' '      # 連続するスペースを1つに
echo "hello123" | tr -d '0-9'         # 数字を削除 → "hello"
```

### 実用的な組み合わせ例

```bash
# アクセスログから最もアクセスの多いURLトップ10
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# エラーログから時間帯別のエラー数
grep "ERROR" app.log | awk '{print substr($1,1,13)}' | sort | uniq -c

# CSVファイルの特定列の合計
awk -F',' '{sum += $3} END {printf "合計: %.2f\n", sum}' sales.csv

# 設定ファイルからキー=バリューを整形
grep -v "^#" config.ini | grep "=" | sort
```

## プロセス管理

プロセスとは、実行中のプログラムのこと。Linuxでは全てのプログラムがプロセスとして動作する。

### プロセスの確認

```bash
# ps - プロセスの一覧
ps                             # 自分のプロセス
ps aux                         # 全ユーザーの全プロセス
ps aux | grep nginx            # nginx関連のプロセスを検索
ps -ef                         # 全プロセスをフルフォーマットで

# psの出力の見方
# USER  PID  %CPU  %MEM  VSZ  RSS  TTY  STAT  START  TIME  COMMAND
# taro  1234  0.0   0.1  123456  4567  ?  S    10:00  0:01  node server.js
```

| 列      | 意味                                             |
| ------- | ------------------------------------------------ |
| USER    | プロセスの所有者                                 |
| PID     | プロセスID（一意の番号）                         |
| %CPU    | CPU使用率                                        |
| %MEM    | メモリ使用率                                     |
| STAT    | プロセスの状態（S:スリープ、R:実行中、Z:ゾンビ） |
| COMMAND | 実行コマンド                                     |

```bash
# top - リアルタイムのプロセス監視
top
# 操作:
#   q     : 終了
#   M     : メモリ順にソート
#   P     : CPU順にソート
#   k     : プロセスをkill（PIDを入力）
#   1     : CPU個別表示

# htop - topの強化版（要インストール）
htop
# カラー表示、マウス操作、ツリー表示が可能
```

### プロセスの制御

```bash
# kill - プロセスの終了
kill 1234                      # プロセスID 1234にSIGTERMを送信（正常終了要求）
kill -9 1234                   # SIGKILL（強制終了）
kill -15 1234                  # SIGTERM（正常終了要求、デフォルト）

# killall - 名前でプロセスを終了
killall nginx
killall -9 node

# バックグラウンド実行
node server.js &               # &をつけるとバックグラウンドで実行
nohup node server.js &         # ターミナルを閉じても実行を継続

# ジョブ管理
jobs                           # バックグラウンドジョブの一覧
fg %1                          # ジョブ1をフォアグラウンドに戻す
bg %1                          # ジョブ1をバックグラウンドで再開
Ctrl+Z                         # 実行中のプロセスを一時停止
Ctrl+C                         # 実行中のプロセスを終了
```

### シグナルの種類

| シグナル | 番号 | 説明                                           |
| -------- | ---- | ---------------------------------------------- |
| SIGHUP   | 1    | ハングアップ。設定の再読み込みに使うことが多い |
| SIGINT   | 2    | 割り込み（Ctrl+C）                             |
| SIGKILL  | 9    | 強制終了（プロセスが無視できない）             |
| SIGTERM  | 15   | 正常終了要求（デフォルト）                     |
| SIGSTOP  | 19   | 一時停止（Ctrl+Z）                             |

**実務でのアドバイス**: まず`kill PID`（SIGTERM）で正常終了を試み、応答しない場合のみ`kill -9 PID`（SIGKILL）を使う。SIGKILLはプロセスが後処理を行えないため、データ破損のリスクがある。

## パッケージ管理

パッケージマネージャは、ソフトウェアのインストール、更新、削除を管理するツール。

### apt（Ubuntu / Debian系）

```bash
# パッケージリストの更新
sudo apt update

# パッケージのインストール
sudo apt install nginx

# パッケージの削除
sudo apt remove nginx
sudo apt purge nginx           # 設定ファイルも含めて削除

# 全パッケージの更新
sudo apt upgrade

# パッケージの検索
apt search nginx

# パッケージ情報の表示
apt show nginx

# 不要なパッケージの削除
sudo apt autoremove
```

### yum / dnf（CentOS / RHEL / Amazon Linux系）

```bash
# パッケージのインストール
sudo yum install nginx         # CentOS 7以前
sudo dnf install nginx         # CentOS 8以降、Fedora

# パッケージの削除
sudo yum remove nginx

# 全パッケージの更新
sudo yum update

# パッケージの検索
yum search nginx
```

### apk（Alpine Linux）

```bash
# パッケージのインストール
apk add nginx

# パッケージの削除
apk del nginx

# パッケージの更新
apk update && apk upgrade

# パッケージの検索
apk search nginx
```

Alpine Linuxはパッケージが軽量なため、Dockerイメージのサイズを小さくしたい場合に特に有用。

## SSH（Secure Shell）

SSHはリモートサーバーに安全に接続するためのプロトコル。

### 基本的な接続

```bash
# パスワード認証で接続
ssh username@hostname
ssh taro@192.168.1.100
ssh taro@example.com

# ポートを指定して接続
ssh -p 2222 taro@example.com
```

### 鍵認証（推奨）

パスワード認証よりも安全。公開鍵と秘密鍵のペアを使う。

```bash
# 鍵ペアの生成
ssh-keygen -t ed25519 -C "taro@example.com"
# 保存先: ~/.ssh/id_ed25519（デフォルト）
# パスフレーズ: 設定推奨

# 生成されるファイル
# ~/.ssh/id_ed25519      秘密鍵（絶対に他人に渡さない）
# ~/.ssh/id_ed25519.pub  公開鍵（サーバーに登録する）

# 公開鍵をサーバーに登録
ssh-copy-id taro@example.com

# 秘密鍵のパーミッション（必ず600にする）
chmod 600 ~/.ssh/id_ed25519
```

### ~/.ssh/config

頻繁に接続するサーバーの設定をファイルに記述しておくと便利。

```
# ~/.ssh/config
Host production
    HostName 203.0.113.1
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519_prod

Host staging
    HostName 203.0.113.2
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519_staging

Host dev-server
    HostName 192.168.1.100
    User taro
    IdentityFile ~/.ssh/id_ed25519
```

```bash
# 設定後は名前だけで接続できる
ssh production
ssh staging
ssh dev-server
```

### scp / rsync - ファイル転送

```bash
# scp - セキュアなファイルコピー
scp file.txt taro@server:/home/taro/       # ローカル→リモート
scp taro@server:/var/log/app.log ./        # リモート→ローカル
scp -r mydir/ taro@server:/home/taro/      # ディレクトリごとコピー

# rsync - 効率的なファイル同期
rsync -avz ./dist/ taro@server:/var/www/html/
#   -a: アーカイブモード（パーミッション保持）
#   -v: 詳細表示
#   -z: 圧縮転送
rsync -avz --delete ./dist/ taro@server:/var/www/html/  # 不要ファイルも削除
```

**rsync vs scp**: rsyncは差分だけを転送するため、2回目以降の同期が高速。デプロイ作業ではrsyncが推奨。

## 環境変数

環境変数は、OSやアプリケーションの動作を制御する変数。

### 基本操作

```bash
# 環境変数の確認
echo $HOME                     # ホームディレクトリ
echo $PATH                     # コマンドの検索パス
echo $USER                     # 現在のユーザー名
echo $SHELL                    # 使用中のシェル
env                            # 全ての環境変数を表示

# 環境変数の設定（現在のシェルのみ）
export NODE_ENV=production
export DATABASE_URL="postgres://user:pass@localhost:5432/mydb"

# 環境変数の削除
unset NODE_ENV

# コマンド実行時だけ環境変数を設定
NODE_ENV=production node server.js
```

### 永続化（.bashrc, .profile）

シェルの起動時に自動的に読み込まれるファイルに環境変数を設定する。

```bash
# ~/.bashrc に追記（bashの場合）
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
echo 'export EDITOR=vim' >> ~/.bashrc

# 変更を反映（再ログインしなくても反映される）
source ~/.bashrc
```

| ファイル           | 読み込みタイミング                  |
| ------------------ | ----------------------------------- |
| `~/.profile`       | ログイン時に1回                     |
| `~/.bashrc`        | 新しいbashシェルを開くたびに        |
| `~/.bash_profile`  | ログイン時に1回（.profileより優先） |
| `/etc/environment` | システム全体の環境変数              |
| `/etc/profile`     | 全ユーザーのログイン時              |

### $PATHの仕組み

`$PATH`は、コマンドを入力したときにどのディレクトリからプログラムを探すかを定義する変数。

```bash
echo $PATH
# /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# コロン区切りで複数のディレクトリが指定されている
# 左から順に検索される

# 新しいパスを追加
export PATH=$HOME/bin:$PATH    # 先頭に追加（優先度が高い）
export PATH=$PATH:/opt/myapp   # 末尾に追加

# whichコマンドでコマンドの場所を確認
which node
# /usr/local/bin/node
```

## シェルスクリプトの基本

シェルスクリプトは、複数のコマンドをファイルにまとめて一括実行するもの。

### 基本構造

```bash
#!/bin/bash
# ↑ シバン（shebang）: このスクリプトをbashで実行することを宣言

# 変数
NAME="Taro"
echo "Hello, $NAME"

# 変数の参照（中括弧で囲むのが安全）
echo "Hello, ${NAME}-san"
```

```bash
# スクリプトの実行方法
chmod +x script.sh      # 実行権限を付与
./script.sh              # 実行

# または
bash script.sh           # bashを指定して実行
```

### 条件分岐（if文）

```bash
#!/bin/bash

# 数値の比較
AGE=25
if [ $AGE -ge 20 ]; then
    echo "成人です"
elif [ $AGE -ge 13 ]; then
    echo "ティーンエイジャーです"
else
    echo "子どもです"
fi

# 文字列の比較
NAME="Taro"
if [ "$NAME" = "Taro" ]; then
    echo "名前はTaroです"
fi

# ファイルの存在チェック
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "Nginx設定ファイルが存在します"
fi

if [ -d "/var/log" ]; then
    echo "/var/log ディレクトリが存在します"
fi
```

比較演算子:

| 演算子 | 数値比較              | 意味       |
| ------ | --------------------- | ---------- |
| `-eq`  | equal                 | 等しい     |
| `-ne`  | not equal             | 等しくない |
| `-gt`  | greater than          | より大きい |
| `-ge`  | greater than or equal | 以上       |
| `-lt`  | less than             | より小さい |
| `-le`  | less than or equal    | 以下       |

| 演算子 | ファイルテスト | 意味                                 |
| ------ | -------------- | ------------------------------------ |
| `-f`   | file           | 通常ファイルが存在する               |
| `-d`   | directory      | ディレクトリが存在する               |
| `-e`   | exists         | ファイルまたはディレクトリが存在する |
| `-r`   | readable       | 読み取り可能                         |
| `-w`   | writable       | 書き込み可能                         |
| `-x`   | executable     | 実行可能                             |

### ループ（for文）

```bash
#!/bin/bash

# リストを使ったループ
for NAME in Taro Hanako Jiro; do
    echo "Hello, $NAME"
done

# 数値の範囲
for i in {1..5}; do
    echo "Count: $i"
done

# ファイルに対するループ
for FILE in *.log; do
    echo "ログファイル: $FILE"
    wc -l "$FILE"
done

# whileループ
COUNT=1
while [ $COUNT -le 5 ]; do
    echo "Count: $COUNT"
    COUNT=$((COUNT + 1))
done
```

### 関数

```bash
#!/bin/bash

# 関数の定義
greet() {
    local NAME=$1  # $1は第1引数。localはローカル変数
    echo "Hello, $NAME!"
}

# 関数の呼び出し
greet "Taro"
greet "Hanako"

# 戻り値を使う関数
is_running() {
    local PROCESS=$1
    if pgrep -x "$PROCESS" > /dev/null; then
        return 0  # 成功（true）
    else
        return 1  # 失敗（false）
    fi
}

if is_running "nginx"; then
    echo "Nginxは実行中です"
else
    echo "Nginxは停止しています"
fi
```

### 実用的なスクリプト例: デプロイスクリプト

```bash
#!/bin/bash
set -e  # エラーが発生したら即座に終了

# 変数定義
APP_DIR="/var/www/myapp"
BACKUP_DIR="/var/backups/myapp"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== デプロイ開始: $DATE ==="

# 1. バックアップ
echo "[1/4] バックアップを作成..."
mkdir -p "$BACKUP_DIR"
tar czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$APP_DIR" .

# 2. コードを更新
echo "[2/4] コードを更新..."
cd "$APP_DIR"
git pull origin main

# 3. 依存関係のインストール
echo "[3/4] 依存関係をインストール..."
npm ci --production

# 4. アプリケーションの再起動
echo "[4/4] アプリケーションを再起動..."
sudo systemctl restart myapp

echo "=== デプロイ完了 ==="
```

## systemd（サービス管理）

systemdは、Linuxのサービス（デーモン）を管理するシステム。Webサーバー、データベース、アプリケーションなどのバックグラウンドプロセスの起動・停止・自動起動を管理する。

### systemctlコマンド

```bash
# サービスの操作
sudo systemctl start nginx       # 起動
sudo systemctl stop nginx        # 停止
sudo systemctl restart nginx     # 再起動
sudo systemctl reload nginx      # 設定の再読み込み（停止せずに）
sudo systemctl status nginx      # 状態確認

# 自動起動の設定
sudo systemctl enable nginx      # OS起動時に自動で起動する
sudo systemctl disable nginx     # 自動起動を無効にする
sudo systemctl is-enabled nginx  # 自動起動が有効か確認

# サービスの一覧
systemctl list-units --type=service                  # 実行中のサービス
systemctl list-units --type=service --state=running  # 実行中のみ
systemctl list-unit-files --type=service             # 全サービス
```

### statusの読み方

```bash
sudo systemctl status nginx
```

```
  nginx.service - A high performance web server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2024-03-28 10:00:00 JST; 2h ago
  Process: 1234 ExecStart=/usr/sbin/nginx (code=exited, status=0/SUCCESS)
 Main PID: 1235 (nginx)
    Tasks: 3
   Memory: 5.2M
   CGroup: /system.slice/nginx.service
           ├─1235 nginx: master process /usr/sbin/nginx
           └─1236 nginx: worker process
```

| 項目     | 説明                               |
| -------- | ---------------------------------- |
| Loaded   | 設定ファイルの場所、自動起動の有無 |
| Active   | 実行状態（running/stopped/failed） |
| Main PID | メインプロセスのID                 |
| Tasks    | プロセス数                         |
| Memory   | メモリ使用量                       |

## ネットワークコマンド

### curl - HTTPリクエスト

```bash
# GETリクエスト
curl https://api.example.com/users

# レスポンスヘッダーも表示
curl -i https://api.example.com/users

# POSTリクエスト（JSONデータ）
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Taro", "email": "taro@example.com"}'

# ファイルのダウンロード
curl -O https://example.com/file.tar.gz
curl -o output.html https://example.com/page

# 認証付きリクエスト
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/me

# レスポンスタイムの計測
curl -w "接続: %{time_connect}s\n合計: %{time_total}s\n" -o /dev/null -s https://example.com

# リダイレクトに追従
curl -L https://example.com/redirect
```

### wget - ファイルのダウンロード

```bash
# ファイルのダウンロード
wget https://example.com/file.tar.gz

# 出力ファイル名を指定
wget -O myfile.tar.gz https://example.com/file.tar.gz

# バックグラウンドでダウンロード
wget -b https://example.com/large-file.iso
```

### ネットワーク確認コマンド

```bash
# ping - 通信確認
ping google.com                # Ctrl+Cで停止
ping -c 4 google.com           # 4回だけpingを送信

# traceroute - ネットワーク経路の追跡
traceroute google.com

# ip addr - IPアドレスの確認
ip addr show                   # 全インターフェースのIP
ip addr show eth0              # 特定インターフェースのIP

# ss - ソケット統計（netstatの後継）
ss -tulnp                      # リッスン中のTCP/UDPポート
#   -t: TCP
#   -u: UDP
#   -l: リッスン中のみ
#   -n: 数値表示（名前解決しない）
#   -p: プロセス情報を表示

# netstat（旧式だが広く使われている）
netstat -tulnp                 # ssと同じ用途

# 特定ポートを使用しているプロセスを確認
ss -tulnp | grep :3000
lsof -i :3000                  # 代替コマンド
```

### DNS確認

```bash
# ドメインのIPアドレスを確認
nslookup example.com
dig example.com

# ホスト名の解決
host example.com
```

## ログ確認

### ログファイルの場所

| ログファイル                | 内容                         |
| --------------------------- | ---------------------------- |
| `/var/log/syslog`           | システム全体のログ（Ubuntu） |
| `/var/log/messages`         | システム全体のログ（CentOS） |
| `/var/log/auth.log`         | 認証関連のログ               |
| `/var/log/nginx/access.log` | Nginxアクセスログ            |
| `/var/log/nginx/error.log`  | Nginxエラーログ              |
| `/var/log/mysql/error.log`  | MySQLエラーログ              |

### ログの閲覧方法

```bash
# リアルタイム監視（最もよく使う）
tail -f /var/log/syslog
tail -f /var/log/nginx/access.log

# 複数ログを同時監視
tail -f /var/log/nginx/access.log /var/log/nginx/error.log

# 特定のキーワードでフィルタしながら監視
tail -f /var/log/app.log | grep "ERROR"

# journalctl（systemdのログ管理）
journalctl                           # 全ログ
journalctl -u nginx                  # nginx サービスのログ
journalctl -u nginx --since "1 hour ago"  # 直近1時間
journalctl -u nginx -f               # リアルタイム監視
journalctl -p err                    # エラーレベル以上のログ
journalctl --disk-usage              # ログのディスク使用量
```

## cron（定期実行）

cronは、指定した時間にコマンドやスクリプトを自動実行する仕組み。

### crontab の操作

```bash
crontab -e                     # 自分のcrontabを編集
crontab -l                     # 自分のcrontabを表示
crontab -r                     # 自分のcrontabを削除
sudo crontab -u taro -e        # 別ユーザーのcrontabを編集
```

### 書式

```
分 時 日 月 曜日 コマンド
```

| フィールド | 範囲              | 特殊文字                                   |
| ---------- | ----------------- | ------------------------------------------ |
| 分         | 0-59              | `*`(毎分), `,`(複数), `-`(範囲), `/`(間隔) |
| 時         | 0-23              | 同上                                       |
| 日         | 1-31              | 同上                                       |
| 月         | 1-12              | 同上                                       |
| 曜日       | 0-7（0と7は日曜） | 同上                                       |

### 設定例

```bash
# 毎日午前3時にバックアップ
0 3 * * * /home/taro/scripts/backup.sh

# 毎時0分にヘルスチェック
0 * * * * curl -s http://localhost:3000/health > /dev/null

# 5分ごとにログを確認
*/5 * * * * /home/taro/scripts/check_logs.sh

# 平日の午前9時に実行
0 9 * * 1-5 /home/taro/scripts/morning_report.sh

# 毎月1日の午前0時に実行
0 0 1 * * /home/taro/scripts/monthly_cleanup.sh

# 毎週日曜の午前2時に実行
0 2 * * 0 /home/taro/scripts/weekly_maintenance.sh

# 出力をログに保存
0 3 * * * /home/taro/scripts/backup.sh >> /var/log/backup.log 2>&1

# 出力を捨てる（メール通知を防ぐ）
*/10 * * * * /home/taro/scripts/task.sh > /dev/null 2>&1
```

### よく使うスケジュール早見表

| スケジュール    | cron式        | 説明                         |
| --------------- | ------------- | ---------------------------- |
| 毎分            | `* * * * *`   | テスト用。本番では使わない   |
| 5分ごと         | `*/5 * * * *` | 監視系                       |
| 毎時            | `0 * * * *`   | 定期レポート                 |
| 毎日午前3時     | `0 3 * * *`   | バックアップ、クリーンアップ |
| 毎週月曜午前9時 | `0 9 * * 1`   | 週次レポート                 |
| 毎月1日         | `0 0 1 * *`   | 月次処理                     |

## vim / nanoエディタの基本操作

サーバー上でファイルを編集する際に使うテキストエディタ。

### nano（初心者向け）

```bash
nano file.txt
```

操作方法は画面下部に表示される。`^`はCtrlキーを意味する。

| 操作       | キー           |
| ---------- | -------------- |
| 保存       | Ctrl+O → Enter |
| 終了       | Ctrl+X         |
| 検索       | Ctrl+W         |
| 切り取り   | Ctrl+K         |
| 貼り付け   | Ctrl+U         |
| 行番号表示 | Ctrl+C         |

### vim（中級者向け、サーバー管理で必須）

vimには**ノーマルモード**と**挿入モード**の2つのモードがある。

```bash
vim file.txt
```

| 操作                 | キー              | モード          |
| -------------------- | ----------------- | --------------- |
| 挿入モードに入る     | `i`               | ノーマル → 挿入 |
| ノーマルモードに戻る | `Esc`             | 挿入 → ノーマル |
| 保存                 | `:w` + Enter      | ノーマル        |
| 終了                 | `:q` + Enter      | ノーマル        |
| 保存して終了         | `:wq` + Enter     | ノーマル        |
| 保存せず終了         | `:q!` + Enter     | ノーマル        |
| 文字を削除           | `x`               | ノーマル        |
| 行を削除             | `dd`              | ノーマル        |
| コピー               | `yy`              | ノーマル        |
| 貼り付け             | `p`               | ノーマル        |
| 元に戻す             | `u`               | ノーマル        |
| 検索                 | `/検索語` + Enter | ノーマル        |
| 次の検索結果         | `n`               | ノーマル        |
| 行番号表示           | `:set number`     | ノーマル        |
| 特定行に移動         | `:行番号`         | ノーマル        |

**最低限覚えること**: `i`で編集開始、`Esc`で編集終了、`:wq`で保存して終了、`:q!`で保存せず終了。この4つだけ覚えればサーバー上でファイル編集ができる。

## 実務でよくある操作シナリオ集

### シナリオ1: サーバーにSSH接続してログを調査

```bash
# 1. サーバーに接続
ssh production

# 2. アプリケーションのログを確認
tail -100 /var/log/myapp/app.log

# 3. エラーだけを抽出
grep "ERROR" /var/log/myapp/app.log | tail -20

# 4. 特定の時間帯のエラーを調査
grep "2024-03-28 14:" /var/log/myapp/app.log | grep "ERROR"

# 5. リアルタイム監視
tail -f /var/log/myapp/app.log | grep "ERROR"
```

### シナリオ2: ディスク容量の調査

```bash
# 1. 全体のディスク使用率を確認
df -h

# 2. 大きなディレクトリを特定
du -sh /* 2>/dev/null | sort -rh | head -10

# 3. さらに掘り下げる
du -sh /var/* | sort -rh | head -10
du -sh /var/log/* | sort -rh | head -10

# 4. 古いログファイルを確認
find /var/log -name "*.log" -mtime +30 -size +100M

# 5. 不要なファイルを削除
sudo rm /var/log/old-app/*.log.gz
```

### シナリオ3: プロセスが動かない時のトラブルシューティング

```bash
# 1. プロセスの状態を確認
sudo systemctl status myapp

# 2. ログを確認
journalctl -u myapp --since "10 minutes ago"

# 3. ポートが使われているか確認
ss -tulnp | grep :3000

# 4. メモリとCPUを確認
free -h          # メモリ
top              # CPU（qで終了）

# 5. サービスを再起動
sudo systemctl restart myapp
sudo systemctl status myapp
```

### シナリオ4: Dockerコンテナ内でのデバッグ

```bash
# コンテナに入る
docker exec -it container_name sh

# ログの確認
cat /var/log/app.log

# ネットワーク確認
curl localhost:3000/health

# プロセス確認
ps aux

# 環境変数確認
env

# DNSが引けるか確認
nslookup database-host

# コンテナから出る
exit
```

## 参考リンク

- [man7.org - Linux man pages](https://man7.org/linux/man-pages/) - Linuxコマンドの公式マニュアルページ
- [linuxcommand.org](https://linuxcommand.org/) - Linuxコマンドラインの学習サイト
- [The Linux Command Line（英語、無料PDF）](https://linuxcommand.org/tlcl.php) - Linuxコマンドラインの無料書籍
- [UNIXコマンド入門 - ドットインストール](https://dotinstall.com/lessons/basic_unix_v3) - 動画で学べるUNIXコマンド入門
- [Ubuntu公式ドキュメント](https://help.ubuntu.com/) - Ubuntu公式のヘルプドキュメント
- [Linux標準教科書（無料PDF）](https://linuc.org/textbooks/linux/) - LPI-Japan提供の無料教科書
- [explainshell.com（コマンドの意味を解説してくれるサイト）](https://explainshell.com/) - コマンドを入力すると各部分の意味を表示
- [crontab.guru（cron式を視覚的に確認）](https://crontab.guru/) - cron式のスケジュールを視覚的に確認
- [Vim Adventures（ゲームでVimを学ぶ）](https://vim-adventures.com/) - ゲーム形式でVimの操作を学習
