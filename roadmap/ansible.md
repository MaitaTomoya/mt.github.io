---
title: 'Ansible'
order: 30
section: 'DevOps/インフラ'
---

# Ansible

## 構成管理ツールとは

構成管理ツールとは、サーバーの設定やソフトウェアのインストールを自動化するためのツールのこと。

例えば、新しいWebサーバーを立てるとき、以下のような作業が必要になる。

1. OSのパッケージを最新にする
2. Nginxをインストールする
3. Nginxの設定ファイルを配置する
4. Node.jsをインストールする
5. アプリケーションをデプロイする
6. PM2（プロセスマネージャ）をインストール・設定する
7. ファイアウォールの設定をする

これを手動でやると、サーバーが1台なら何とかなるが、10台、100台となると現実的ではない。構成管理ツールは、この設定作業を「コード」として記述し、何台のサーバーに対しても一括で自動実行できるようにする。

身近な例で言えば、構成管理ツールは「引越し業者のチェックリスト」のようなもの。新しい家（サーバー）に必要なもの（ソフトウェアや設定）を全てリスト化し、手順通りに準備してくれる。

## Ansibleとは

AnsibleはRed Hat社が開発・メンテナンスしているオープンソースの構成管理ツール。以下の3つの特徴がある。

| 特徴             | 説明                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| エージェントレス | 管理対象サーバーに専用ソフトをインストールする必要がない                   |
| SSH接続          | 既存のSSH接続を利用するため、追加のポート開放が不要                        |
| YAML記述         | 設定をYAML形式で記述するため、プログラミング経験がなくても読み書きしやすい |

### エージェントレスとは

ChefやPuppetなどの他のツールは、管理対象のサーバーに「エージェント」と呼ばれる常駐プログラムをインストールする必要がある。一方、AnsibleはSSH接続さえできれば動作するため、管理対象サーバーへの事前準備がほとんど不要。

```
【エージェント方式（Chef, Puppet）】
管理サーバー ──→ 対象サーバー（エージェントが常駐）
                   ↑ エージェントのインストールが必要
                   ↑ エージェントの更新も必要

【エージェントレス方式（Ansible）】
管理サーバー ──SSH──→ 対象サーバー
                        ↑ SSHが使えれば何もインストール不要
```

## Terraform vs Ansible

TerraformとAnsibleはよく比較されるが、役割が異なる。

| 比較項目   | Terraform                        | Ansible                                 |
| ---------- | -------------------------------- | --------------------------------------- |
| 主な役割   | プロビジョニング（インフラ構築） | 構成管理（サーバー設定）                |
| 何をするか | サーバーやネットワークを「作る」 | サーバーに「設定する」                  |
| 操作対象   | クラウドAPI（AWS, GCP等）        | サーバーOS（SSH接続）                   |
| 例え       | 土地を買って家を建てる           | 家の中に家具を配置する                  |
| 具体例     | EC2インスタンスの作成、VPCの構築 | Nginxのインストール、設定ファイルの配置 |
| 記述方式   | 宣言的                           | 宣言的（手続き的な面もある）            |
| 状態管理   | ステートファイルで管理           | ステートファイルなし                    |

### 使い分けの指針

```
Terraform で → サーバー、ネットワーク、データベースなどのインフラを構築
     ↓
Ansible で → 構築したサーバーにソフトウェアをインストール、設定を適用
```

実際のプロジェクトでは、TerraformとAnsibleを組み合わせて使うことが多い。Terraformでインフラを作り、Ansibleでそのインフラの上にアプリケーション環境を構築するという流れ。

## Chef/Puppet vs Ansible

| 比較項目         | Ansible                  | Chef                                       | Puppet                                     |
| ---------------- | ------------------------ | ------------------------------------------ | ------------------------------------------ |
| 開発元           | Red Hat                  | Progress Software                          | Puppet Inc.                                |
| エージェント     | 不要（エージェントレス） | 必要                                       | 必要                                       |
| 記述言語         | YAML                     | Ruby（DSL）                                | 独自DSL                                    |
| 学習コスト       | 低い                     | 高い                                       | 中程度                                     |
| アーキテクチャ   | プッシュ型               | プル型                                     | プル型                                     |
| 初期セットアップ | 簡単                     | 複雑                                       | やや複雑                                   |
| 適用方法         | 管理サーバーから実行     | クライアントが定期的にサーバーに問い合わせ | クライアントが定期的にサーバーに問い合わせ |
| 大規模運用       | Tower/AWXで対応          | Chef Serverで対応                          | Puppet Serverで対応                        |

### プッシュ型 vs プル型

```
【プッシュ型（Ansible）】
管理者が「今すぐ実行」を指示 → 管理サーバー → SSHで対象に設定を適用

【プル型（Chef, Puppet）】
対象サーバーのエージェントが定期的にサーバーに「変更ある？」と問い合わせ
→ 変更があれば自分自身に適用
```

Ansibleが広く使われている理由は、学習コストの低さとエージェントレスのシンプルさにある。YAMLで設定を書くだけで良いため、プログラミングの知識がなくても始められる。

## インストール方法

### pipでインストール（推奨）

```bash
# Pythonのpipでインストール
pip install ansible

# バージョン確認
ansible --version

# 特定のバージョンをインストール
pip install ansible==9.0.0
```

### macOS

```bash
# Homebrewでインストール
brew install ansible
```

### Ubuntu/Debian

```bash
# aptでインストール
sudo apt update
sudo apt install ansible
```

### インストール確認

```bash
$ ansible --version
ansible [core 2.16.0]
  config file = None
  configured module search path = ['/home/user/.ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  executable location = /usr/bin/ansible
  python version = 3.11.6
```

## 基本概念

Ansibleを使いこなすために理解すべき概念を解説する。

### 概念の全体像

```
[Inventory]  管理対象ホストの一覧
     ↓
[Playbook]   実行したい処理の定義（YAMLファイル）
     ↓
[Task]       個別の処理（1つ1つの手順）
     ↓
[Module]     実際の処理を行う部品（apt, copy, service等）
     ↓
[Handler]    特定の条件で実行される処理（サービス再起動等）
     ↓
[Role]       再利用可能な設定のパッケージ
     ↓
[Variable]   設定値を外部化したもの
     ↓
[Template]   変数を埋め込める設定ファイルのテンプレート（Jinja2）
```

| 概念      | 説明                         | 例え                             |
| --------- | ---------------------------- | -------------------------------- |
| Inventory | 管理対象のサーバー一覧       | 住所録                           |
| Playbook  | 実行手順の定義書             | レシピ本                         |
| Task      | 個別の実行手順               | レシピの各ステップ               |
| Module    | 実際の処理を行う道具         | 調理器具（包丁、鍋など）         |
| Handler   | 条件付き処理                 | 「味見して足りなければ塩を足す」 |
| Role      | 再利用可能な設定セット       | 料理のジャンル別レシピ集         |
| Variable  | 外部化された設定値           | 材料の分量表                     |
| Template  | 動的に生成される設定ファイル | 人数に応じて分量を変えるレシピ   |

## インベントリ

インベントリは「どのサーバーに対して作業するか」を定義するファイル。

### INI形式

```ini
# inventory.ini

# グループなし（ungrouped）
192.168.1.100

# Webサーバーグループ
[webservers]
web1.example.com
web2.example.com
192.168.1.101

# DBサーバーグループ
[dbservers]
db1.example.com ansible_port=3306
db2.example.com

# ステージング環境（子グループ）
[staging:children]
webservers
dbservers

# グループ変数
[webservers:vars]
ansible_user=deploy
ansible_ssh_private_key_file=~/.ssh/deploy_key
http_port=80
```

### YAML形式

```yaml
# inventory.yml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
          ansible_port: 2222
      vars:
        ansible_user: deploy
        http_port: 80

    dbservers:
      hosts:
        db1.example.com:
          ansible_port: 3306
        db2.example.com:

    staging:
      children:
        webservers:
        dbservers:
```

### 動的インベントリ

クラウド環境では、サーバーが動的に増減するため、静的なインベントリファイルでは管理が難しい。AWSなどのクラウドから動的にホスト情報を取得できる。

```yaml
# aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions:
  - ap-northeast-1
filters:
  tag:Environment: production
  instance-state-name: running
keyed_groups:
  - key: tags.Role
    prefix: role
```

### インベントリの確認コマンド

```bash
# ホスト一覧の確認
ansible-inventory -i inventory.yml --list

# グラフ表示
ansible-inventory -i inventory.yml --graph
```

## Playbookの構造

PlaybookはAnsibleの中核。「何を」「どこに」「どのように」設定するかをYAMLで記述する。

### 基本構造

```yaml
# site.yml
---
# 1つのPlayは1つのホストグループに対する一連のタスク
- name: Webサーバーのセットアップ
  hosts: webservers # 対象ホスト（インベントリのグループ名）
  become: true # root権限で実行（sudo）
  gather_facts: true # サーバー情報を収集する

  vars: # 変数定義
    app_name: myapp
    app_port: 3000

  tasks: # 実行するタスクの一覧
    - name: パッケージの更新
      apt:
        update_cache: true
        upgrade: dist

    - name: Nginxのインストール
      apt:
        name: nginx
        state: present

    - name: Nginxの起動
      service:
        name: nginx
        state: started
        enabled: true

  handlers: # 通知を受けたときに実行するタスク
    - name: Nginxの再起動
      service:
        name: nginx
        state: restarted
```

### Playbookの実行

```bash
# 実行
ansible-playbook -i inventory.yml site.yml

# ドライラン（実際には変更しない）
ansible-playbook -i inventory.yml site.yml --check

# 差分表示
ansible-playbook -i inventory.yml site.yml --diff

# 詳細出力
ansible-playbook -i inventory.yml site.yml -v    # 詳細
ansible-playbook -i inventory.yml site.yml -vv   # より詳細
ansible-playbook -i inventory.yml site.yml -vvv  # デバッグレベル

# 特定のタスクから開始
ansible-playbook -i inventory.yml site.yml --start-at-task="Nginxのインストール"

# 特定のタグのみ実行
ansible-playbook -i inventory.yml site.yml --tags "install"
```

## よく使うモジュール

Ansibleのモジュールは「実際の処理を行う道具」。数百種類のモジュールが用意されている。

### apt / yum（パッケージ管理）

```yaml
# Debian/Ubuntu系（apt）
- name: Nginxのインストール
  apt:
    name: nginx
    state: present # インストール済みであること
    update_cache: true # apt updateを事前に実行

- name: 複数パッケージのインストール
  apt:
    name:
      - nginx
      - curl
      - git
      - htop
    state: present

- name: パッケージの削除
  apt:
    name: nginx
    state: absent # インストールされていないこと

# RHEL/CentOS系（yum）
- name: Nginxのインストール
  yum:
    name: nginx
    state: present
```

`state`の値:

| 値        | 意味                                           |
| --------- | ---------------------------------------------- |
| `present` | インストールされていること（最新でなくてもOK） |
| `latest`  | 最新バージョンであること                       |
| `absent`  | インストールされていないこと（削除）           |

### copy（ファイルコピー）

```yaml
# ローカルファイルをリモートにコピー
- name: Nginx設定ファイルのコピー
  copy:
    src: files/nginx.conf # ローカルのファイルパス
    dest: /etc/nginx/nginx.conf # リモートの配置先
    owner: root
    group: root
    mode: '0644' # パーミッション
    backup: true # 既存ファイルのバックアップ
  notify: Nginxの再起動 # 変更があったらハンドラーを実行

# 文字列を直接書き込む
- name: index.htmlの作成
  copy:
    content: |
      <html>
      <body>
        <h1>Hello from Ansible!</h1>
      </body>
      </html>
    dest: /var/www/html/index.html
    mode: '0644'
```

### template（テンプレートファイル）

Jinja2テンプレートを使って、変数を埋め込んだ設定ファイルを生成する。

```yaml
# タスク
- name: Nginx設定ファイルのテンプレート展開
  template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/sites-available/{{ app_name }}
    owner: root
    group: root
    mode: '0644'
  notify: Nginxの再起動
```

```jinja2
{# templates/nginx.conf.j2 #}
server {
    listen {{ http_port | default(80) }};
    server_name {{ server_name }};

    location / {
        proxy_pass http://127.0.0.1:{{ app_port }};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    {% if ssl_enabled %}
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/{{ server_name }}.crt;
    ssl_certificate_key /etc/ssl/private/{{ server_name }}.key;
    {% endif %}

    access_log /var/log/nginx/{{ app_name }}_access.log;
    error_log /var/log/nginx/{{ app_name }}_error.log;
}
```

### service（サービス管理）

```yaml
- name: Nginxの起動と自動起動設定
  service:
    name: nginx
    state: started # 起動していること
    enabled: true # OS起動時に自動起動

- name: Nginxの再起動
  service:
    name: nginx
    state: restarted # 再起動
```

`state`の値:

| 値          | 意味                                         |
| ----------- | -------------------------------------------- |
| `started`   | 起動していること（停止していたら起動）       |
| `stopped`   | 停止していること（起動していたら停止）       |
| `restarted` | 再起動する（常に実行）                       |
| `reloaded`  | 設定を再読み込みする（サービスは停止しない） |

### file（ファイル/ディレクトリ管理）

```yaml
# ディレクトリの作成
- name: アプリケーションディレクトリの作成
  file:
    path: /opt/myapp
    state: directory
    owner: deploy
    group: deploy
    mode: '0755'

# シンボリックリンクの作成
- name: Nginx設定のシンボリックリンク
  file:
    src: /etc/nginx/sites-available/myapp
    dest: /etc/nginx/sites-enabled/myapp
    state: link

# ファイルの削除
- name: 不要なファイルの削除
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent
```

### user（ユーザー管理）

```yaml
- name: deployユーザーの作成
  user:
    name: deploy
    shell: /bin/bash
    groups: sudo,www-data
    append: true
    create_home: true

- name: SSH公開鍵の設定
  authorized_key:
    user: deploy
    key: "{{ lookup('file', '~/.ssh/id_rsa.pub') }}"
    state: present
```

### git（Gitリポジトリ）

```yaml
- name: アプリケーションコードの取得
  git:
    repo: https://github.com/example/myapp.git
    dest: /opt/myapp
    version: main
    force: true
  become_user: deploy
```

### command / shell（コマンド実行）

```yaml
# command: シェルを経由しない（パイプやリダイレクトは使えない）
- name: Node.jsのバージョン確認
  command: node --version
  register: node_version
  changed_when: false # このタスクは「変更」として扱わない

# shell: シェルを経由する（パイプやリダイレクトが使える）
- name: ログファイルのクリーンアップ
  shell: find /var/log -name "*.log" -mtime +30 | xargs rm -f
```

`command`と`shell`の使い分け:

| モジュール | シェル経由 | パイプ/リダイレクト | セキュリティ                         |
| ---------- | ---------- | ------------------- | ------------------------------------ |
| `command`  | いいえ     | 使えない            | 高い                                 |
| `shell`    | はい       | 使える              | やや低い（インジェクションの可能性） |

基本的には`command`を使い、パイプやリダイレクトが必要な場合のみ`shell`を使う。

### docker_container（Docker操作）

```yaml
- name: Redisコンテナの起動
  docker_container:
    name: redis
    image: redis:7-alpine
    state: started
    restart_policy: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
```

## 変数

### 変数の定義方法

```yaml
# Playbook内で定義
- hosts: webservers
  vars:
    app_name: myapp
    app_port: 3000
    packages:
      - nginx
      - curl
      - git

# 変数ファイルから読み込み
- hosts: webservers
  vars_files:
    - vars/common.yml
    - vars/{{ environment }}.yml
```

### group_vars / host_vars

ディレクトリ構成でグループやホストごとの変数を管理する。

```
inventory/
  hosts.yml
  group_vars/
    all.yml         # 全ホスト共通の変数
    webservers.yml  # webserversグループの変数
    dbservers.yml   # dbserversグループの変数
  host_vars/
    web1.example.com.yml  # 特定ホストの変数
```

```yaml
# group_vars/all.yml
ntp_server: ntp.example.com
timezone: Asia/Tokyo

# group_vars/webservers.yml
http_port: 80
https_port: 443
nginx_worker_processes: auto

# host_vars/web1.example.com.yml
server_name: web1.example.com
ssl_enabled: true
```

### register（タスクの結果を変数に保存）

```yaml
- name: ディスク使用量の確認
  command: df -h /
  register: disk_usage
  changed_when: false

- name: ディスク使用量の表示
  debug:
    var: disk_usage.stdout_lines

- name: ディスク使用率が90%以上の場合に警告
  debug:
    msg: '警告: ディスク使用率が高いです！'
  when: disk_usage.stdout is search("9[0-9]%")
```

### facts（サーバー情報の自動収集）

Ansibleは実行時にサーバーの情報（OS、IPアドレス、メモリなど）を自動収集する。これをfactsと呼ぶ。

```yaml
- name: OS情報の表示
  debug:
    msg: |
      OS: {{ ansible_distribution }} {{ ansible_distribution_version }}
      IP: {{ ansible_default_ipv4.address }}
      CPU: {{ ansible_processor_cores }}コア
      メモリ: {{ ansible_memtotal_mb }}MB

- name: Ubuntu固有の処理
  apt:
    name: ufw
    state: present
  when: ansible_distribution == "Ubuntu"

- name: CentOS固有の処理
  yum:
    name: firewalld
    state: present
  when: ansible_distribution == "CentOS"
```

## テンプレート（Jinja2）

Jinja2はPythonのテンプレートエンジン。設定ファイルに変数や条件分岐を埋め込める。

### 基本構文

```jinja2
{# コメント #}

{# 変数の展開 #}
ServerName {{ server_name }}

{# フィルター（変数の加工） #}
ServerName {{ server_name | lower }}
MaxMemory {{ max_memory_mb | default(512) }}

{# 条件分岐 #}
{% if environment == "production" %}
LogLevel warn
{% else %}
LogLevel debug
{% endif %}

{# 繰り返し #}
{% for server in upstream_servers %}
server {{ server.host }}:{{ server.port }};
{% endfor %}
```

### 実践的なテンプレート例

```jinja2
{# templates/pm2.ecosystem.config.js.j2 #}
module.exports = {
  apps: [
    {
      name: "{{ app_name }}",
      script: "{{ app_dir }}/server.js",
      instances: {{ app_instances | default('max') }},
      exec_mode: "cluster",
      env: {
        NODE_ENV: "{{ environment }}",
        PORT: {{ app_port }},
{% for key, value in app_env_vars.items() %}
        {{ key }}: "{{ value }}",
{% endfor %}
      },
      error_file: "/var/log/{{ app_name }}/error.log",
      out_file: "/var/log/{{ app_name }}/out.log",
      merge_logs: true,
      max_memory_restart: "{{ max_memory | default('1G') }}",
    },
  ],
};
```

## ハンドラー

ハンドラーは「何かが変更されたときだけ実行するタスク」。例えば、設定ファイルを変更したときだけサービスを再起動する、という使い方をする。

```yaml
- hosts: webservers
  become: true

  tasks:
    - name: Nginx設定ファイルの配置
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: # 変更があった場合にハンドラーに通知
        - Nginxの設定テスト
        - Nginxの再起動

    - name: SSL証明書の配置
      copy:
        src: files/ssl/
        dest: /etc/ssl/
      notify: Nginxの再起動 # 複数のタスクから同じハンドラーを呼べる

  handlers:
    - name: Nginxの設定テスト
      command: nginx -t
      changed_when: false

    - name: Nginxの再起動
      service:
        name: nginx
        state: restarted
```

ハンドラーの特徴:

| 特徴         | 説明                                              |
| ------------ | ------------------------------------------------- |
| 条件付き実行 | notifyしたタスクが「changed」の場合のみ実行       |
| 重複排除     | 複数のタスクからnotifyされても1回しか実行されない |
| 最後に実行   | 全てのタスクが完了した後にまとめて実行される      |
| 順序制御     | ハンドラーの定義順に実行される                    |

## ロール（Role）

ロールは「再利用可能な設定のパッケージ」。関連するタスク、変数、テンプレート、ファイルを1つのディレクトリにまとめる。

### ロールのディレクトリ構成

```
roles/
  nginx/
    tasks/
      main.yml        # メインのタスク
    handlers/
      main.yml        # ハンドラー
    templates/
      nginx.conf.j2   # テンプレートファイル
    files/
      index.html      # 静的ファイル
    vars/
      main.yml        # 変数（優先度高）
    defaults/
      main.yml        # デフォルト変数（優先度低）
    meta/
      main.yml        # ロールのメタデータ（依存関係等）
```

### ロールの実装例

```yaml
# roles/nginx/defaults/main.yml
nginx_port: 80
nginx_worker_processes: auto
nginx_worker_connections: 1024


# roles/nginx/tasks/main.yml
---
- name: Nginxのインストール
  apt:
    name: nginx
    state: present
    update_cache: true

- name: Nginx設定ファイルの配置
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: Nginxの再起動

- name: デフォルトサイトの無効化
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent
  notify: Nginxの再起動

- name: Nginxの起動と自動起動設定
  service:
    name: nginx
    state: started
    enabled: true

# roles/nginx/handlers/main.yml
---
- name: Nginxの再起動
  service:
    name: nginx
    state: restarted
```

### ロールの使用

```yaml
# site.yml
---
- hosts: webservers
  become: true
  roles:
    - nginx
    - nodejs
    - role: app_deploy
      vars:
        app_name: myapp
        app_port: 3000
```

## Ansible Galaxy

Ansible Galaxyは、コミュニティが作成したロールやコレクションを共有・配布するプラットフォーム。npmやpipのようなもの。

```bash
# ロールのインストール
ansible-galaxy install geerlingguy.docker
ansible-galaxy install geerlingguy.nodejs

# コレクションのインストール
ansible-galaxy collection install community.docker
ansible-galaxy collection install amazon.aws

# requirements.ymlから一括インストール
ansible-galaxy install -r requirements.yml
```

```yaml
# requirements.yml
roles:
  - name: geerlingguy.docker
    version: 6.1.0
  - name: geerlingguy.nodejs
    version: 6.0.0

collections:
  - name: community.docker
    version: 3.4.0
  - name: amazon.aws
    version: 7.0.0
```

## 冪等性（べきとうせい）

冪等性とは「何度実行しても同じ結果になる性質」のこと。Ansibleの最も重要な概念の1つ。

### 冪等性がある例

```yaml
# aptモジュールは冪等性がある
- name: Nginxのインストール
  apt:
    name: nginx
    state: present
  # 1回目: Nginxがインストールされる（changed）
  # 2回目: 既にインストール済みなので何もしない（ok）
  # 3回目: 同上（ok）
```

### 冪等性がない例

```yaml
# shellモジュールは冪等性がない（毎回実行される）
- name: データベースの初期化
  shell: mysql -u root -e "CREATE DATABASE myapp;"
  # 1回目: データベースが作成される
  # 2回目: エラー！（既にデータベースが存在する）
```

### 冪等性を保つ工夫

```yaml
# 方法1: creates/removes で実行条件を設定
- name: データベースの初期化
  shell: mysql -u root -e "CREATE DATABASE myapp;"
  args:
    creates: /var/lib/mysql/myapp # このファイルが存在しなければ実行

# 方法2: when で条件を設定
- name: データベースの存在確認
  command: mysql -u root -e "SHOW DATABASES LIKE 'myapp';"
  register: db_check
  changed_when: false

- name: データベースの作成
  shell: mysql -u root -e "CREATE DATABASE myapp;"
  when: "'myapp' not in db_check.stdout"
```

冪等性が重要な理由:

- 同じPlaybookを安全に何度でも実行できる
- 途中で失敗しても、再実行するだけで正しい状態に収束する
- 環境のドリフト（意図しない差異）を防止できる

## 実践例: Webサーバーの構築自動化

Nginx + Node.js + PM2の環境をAnsibleで自動構築する完全な例。

### ディレクトリ構成

```
ansible-webserver/
  inventory/
    hosts.yml
    group_vars/
      webservers.yml
  roles/
    common/
      tasks/main.yml
    nginx/
      tasks/main.yml
      handlers/main.yml
      templates/nginx-app.conf.j2
    nodejs/
      tasks/main.yml
    app/
      tasks/main.yml
      handlers/main.yml
      templates/ecosystem.config.js.j2
  site.yml
```

### site.yml

```yaml
---
- name: Webサーバーのセットアップ
  hosts: webservers
  become: true

  roles:
    - common
    - nginx
    - nodejs
    - app
```

### inventory/hosts.yml

```yaml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          ansible_user: ubuntu
          ansible_ssh_private_key_file: ~/.ssh/web_key
```

### inventory/group_vars/webservers.yml

```yaml
# アプリケーション設定
app_name: myapp
app_port: 3000
app_dir: /opt/myapp
app_repo: https://github.com/example/myapp.git
app_branch: main

# Node.js設定
nodejs_version: '20'

# Nginx設定
server_name: example.com
ssl_enabled: false

# ユーザー設定
deploy_user: deploy
deploy_group: deploy
```

### roles/common/tasks/main.yml

```yaml
---
- name: パッケージの更新
  apt:
    update_cache: true
    upgrade: dist
    cache_valid_time: 3600

- name: 必要なパッケージのインストール
  apt:
    name:
      - git
      - curl
      - htop
      - ufw
      - fail2ban
    state: present

- name: タイムゾーンの設定
  timezone:
    name: Asia/Tokyo

- name: deployユーザーの作成
  user:
    name: '{{ deploy_user }}'
    shell: /bin/bash
    groups: sudo
    append: true
    create_home: true

- name: UFWの設定 - SSH
  ufw:
    rule: allow
    port: '22'
    proto: tcp

- name: UFWの設定 - HTTP
  ufw:
    rule: allow
    port: '80'
    proto: tcp

- name: UFWの設定 - HTTPS
  ufw:
    rule: allow
    port: '443'
    proto: tcp

- name: UFWの有効化
  ufw:
    state: enabled
    policy: deny
```

### roles/nginx/tasks/main.yml

```yaml
---
- name: Nginxのインストール
  apt:
    name: nginx
    state: present

- name: デフォルトサイトの無効化
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent
  notify: Nginxの再起動

- name: アプリケーション用のNginx設定
  template:
    src: nginx-app.conf.j2
    dest: '/etc/nginx/sites-available/{{ app_name }}'
    mode: '0644'
  notify: Nginxの再起動

- name: Nginx設定の有効化
  file:
    src: '/etc/nginx/sites-available/{{ app_name }}'
    dest: '/etc/nginx/sites-enabled/{{ app_name }}'
    state: link
  notify: Nginxの再起動

- name: Nginxの起動と自動起動設定
  service:
    name: nginx
    state: started
    enabled: true
```

### roles/nginx/handlers/main.yml

```yaml
---
- name: Nginxの再起動
  service:
    name: nginx
    state: restarted
```

### roles/nginx/templates/nginx-app.conf.j2

```jinja2
upstream {{ app_name }} {
    server 127.0.0.1:{{ app_port }};
}

server {
    listen 80;
    server_name {{ server_name }};

    location / {
        proxy_pass http://{{ app_name }};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/{{ app_name }}_access.log;
    error_log /var/log/nginx/{{ app_name }}_error.log;
}
```

### roles/nodejs/tasks/main.yml

```yaml
---
- name: NodeSourceリポジトリの追加
  shell: |
    curl -fsSL https://deb.nodesource.com/setup_{{ nodejs_version }}.x | bash -
  args:
    creates: /etc/apt/sources.list.d/nodesource.list

- name: Node.jsのインストール
  apt:
    name: nodejs
    state: present

- name: PM2のグローバルインストール
  npm:
    name: pm2
    global: true
    state: present

- name: PM2の自動起動設定
  command: pm2 startup systemd -u {{ deploy_user }} --hp /home/{{ deploy_user }}
  args:
    creates: /etc/systemd/system/pm2-{{ deploy_user }}.service
```

### roles/app/tasks/main.yml

```yaml
---
- name: アプリケーションディレクトリの作成
  file:
    path: '{{ app_dir }}'
    state: directory
    owner: '{{ deploy_user }}'
    group: '{{ deploy_group }}'
    mode: '0755'

- name: ログディレクトリの作成
  file:
    path: '/var/log/{{ app_name }}'
    state: directory
    owner: '{{ deploy_user }}'
    group: '{{ deploy_group }}'
    mode: '0755'

- name: アプリケーションコードの取得
  git:
    repo: '{{ app_repo }}'
    dest: '{{ app_dir }}'
    version: '{{ app_branch }}'
    force: true
  become_user: '{{ deploy_user }}'
  notify: アプリケーションの再起動

- name: npm依存関係のインストール
  npm:
    path: '{{ app_dir }}'
    production: true
  become_user: '{{ deploy_user }}'
  notify: アプリケーションの再起動

- name: PM2設定ファイルの配置
  template:
    src: ecosystem.config.js.j2
    dest: '{{ app_dir }}/ecosystem.config.js'
    owner: '{{ deploy_user }}'
    group: '{{ deploy_group }}'
  notify: アプリケーションの再起動
```

### roles/app/handlers/main.yml

```yaml
---
- name: アプリケーションの再起動
  shell: |
    cd {{ app_dir }}
    pm2 delete {{ app_name }} || true
    pm2 start ecosystem.config.js
    pm2 save
  become_user: '{{ deploy_user }}'
```

### roles/app/templates/ecosystem.config.js.j2

```jinja2
module.exports = {
  apps: [
    {
      name: "{{ app_name }}",
      script: "{{ app_dir }}/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: {{ app_port }},
      },
      error_file: "/var/log/{{ app_name }}/error.log",
      out_file: "/var/log/{{ app_name }}/out.log",
      merge_logs: true,
      max_memory_restart: "1G",
    },
  ],
};
```

### 実行コマンド

```bash
# ドライランで確認
ansible-playbook -i inventory/hosts.yml site.yml --check --diff

# 実行
ansible-playbook -i inventory/hosts.yml site.yml

# 特定のロールのみ実行（タグを使う場合）
ansible-playbook -i inventory/hosts.yml site.yml --tags "app"
```

## ベストプラクティス

### ディレクトリ構成

```
ansible-project/
  inventory/
    production/
      hosts.yml
      group_vars/
        all.yml
        webservers.yml
    staging/
      hosts.yml
      group_vars/
        all.yml
        webservers.yml
  roles/
    common/
    nginx/
    nodejs/
    app/
  site.yml                # メインPlaybook
  webservers.yml          # Webサーバー用Playbook
  dbservers.yml           # DBサーバー用Playbook
  ansible.cfg             # Ansible設定ファイル
  requirements.yml        # Galaxy依存関係
```

### ansible.cfg

```ini
[defaults]
inventory = inventory/production/hosts.yml
remote_user = deploy
private_key_file = ~/.ssh/deploy_key
host_key_checking = False
retry_files_enabled = False
stdout_callback = yaml

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

### 暗号化（ansible-vault）

機密情報をAnsible Vaultで暗号化して管理する。

```bash
# ファイルの暗号化
ansible-vault encrypt inventory/production/group_vars/vault.yml

# 暗号化されたファイルの編集
ansible-vault edit inventory/production/group_vars/vault.yml

# Playbookの実行時にパスワードを入力
ansible-playbook site.yml --ask-vault-pass

# パスワードファイルを指定
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

```yaml
# inventory/production/group_vars/vault.yml（暗号化前）
vault_db_password: 'SuperSecretPassword123'
vault_api_key: 'sk-1234567890abcdef'

# 使用時（他のファイルから参照）
# group_vars/all.yml
db_password: '{{ vault_db_password }}'
api_key: '{{ vault_api_key }}'
```

### その他のベストプラクティス

| 項目           | ルール                                        |
| -------------- | --------------------------------------------- |
| タスク名       | 必ず`name`を付け、何をするかわかるようにする  |
| 冪等性         | `command`/`shell`より専用モジュールを優先する |
| 変数           | デフォルト値は`defaults/main.yml`に定義する   |
| 機密情報       | `ansible-vault`で暗号化する                   |
| テスト         | `--check`モードで事前確認する                 |
| バージョン管理 | Playbookは必ずGitで管理する                   |
| ロール         | 機能ごとにロールに分割する                    |

## 参考リンク

- [Ansible公式ドキュメント](https://docs.ansible.com/ansible/latest/index.html)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Ansible モジュール一覧](https://docs.ansible.com/ansible/latest/collections/index_module.html)
- [Ansible ベストプラクティス](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html)
- [Jinja2 テンプレート構文](https://jinja.palletsprojects.com/en/3.1.x/templates/)
