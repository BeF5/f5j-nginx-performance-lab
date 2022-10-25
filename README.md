# はじめに

- こちらの内容は、F5/NGINX のラボ環境の利用を前提にしています
- その他環境で利用する場合にはAnsibleのHostsなど適宜修正し利用してください


# 想定する構成

- ラボ環境は以下のような構成
  - Locust: 10.1.1.7
    - パフォーマンステストツール
    - コンテナで実行する
    - CLIやWebUIを用いて操作する
  - monitor: 10.1.1.8
    - Grafana , Prometheus を監視サーバとして実行する
    - コンテナで実行する
    - 各HostにNode Exporterを実行し、そこからステータスを取得する
  - Webサーバ: 10.1.1.4, 10.1.1.5, 10.1.1.6
    - WebサーバとWordPress、MariaDBをデプロイ、コンテンツを応答する
    - Webサーバとして、10.1.1.4 が NGINX Unit、 10.1.1.5 が NGINX Plus、 10.1.1.6 が Apache を利用する
  - その他実装予定のサーバ:
    - NGINX Plusで通信をProxy、またキャッシュし、通信のスループットや改善に関する動作を確認する


# 手順
## 0. 前提条件

- 作業ホストから各ホストへ公開鍵認証でSSHができること
- 作業ホストが認証に利用するSSH鍵を .ssh/id_rsa に配置していること
- Ansibleを実行した先のホストでsudoが実行できること。パスワードなしで実行できることが望ましい
- ansibleを利用しますのでInstallしてください
- ホストはすべてUbuntu20.04を想定しています

### 必要なファイルの取得

作業ホストにて情報の取得

```
git clone https://github.com/BeF5/f5j-nginx-performance.git
```

## 1. NGINX Unit + Wordpress のインストール

### Ansible Module Roleの取得

```
ansible-galaxy install nginxinc.nginx_unit
```

### インストール

```
ansible-playbook -i hosts -l host1 nunit-wp-setup.yaml
```

## 2. NGINX Plus + Wordpress のインストール

### ライセンスファイルのコピー

ライセンスファイルを取得し、$HOMEフォルダにコピーしてください
```
$ ls $HOME
nginx-repo.crt  nginx-repo.key
```

### Ansible Module Collectionの取得

```
ansible-galaxy collection install nginxinc.nginx_core
```

### インストール

```
ansible-playbook -i hosts -l host2 nplus-wp-setup.yaml
```

## 3. Apache + Wordpress のインストール

```
ansible-playbook -i hosts -l host3 apache-wp-setup.yaml
```

## 4. Locust の実行

```
ansible-playbook -i hosts -l locust start-locust.yaml
```

## 5. Grafana + Prometheus の実行

### Grafana + Prometheus の実行

```
ansible-playbook -i hosts -l monitor start-monitor.yaml
```

### 各HostにNode Exporterの実行

```
ansible-playbook -i hosts start-node-exporter.yaml  
```

## 通信の実行

### 各Webサーバが待ち受けるURL

- 各Webサーバは、以下のURLに対し HTTP(TCP/80)、HTTPS(TCP/443)で通信を待ち受ける
  - /
    - wordpress User Contents
  - /wp-admin
    - wordpress 管理ページ
  - /html
    - html静的ファイル


### Locustの利用

- 各対象に対し通信を実行する。その結果を確認する
- Locust のホストは以下のようなフォルダ構成となる
  - config
    - Locust の宛先、通信量などを指定する設定ファイルを格納しています
  - senario
    - Locust の実行シナリオを格納しています
  - result
    - Ansible を実行する際にフォルダを生成します

- Web ブラウザを利用する場合
  - Locust のホストを対象とした以下URLに接続する
  - http://**locust IP**:8089

- CLI を利用する場合
  - Locust のホストで以下のようなコマンドを実行する

    ```
    docker run -d -v "/home/ubuntu/locust:/mnt/locust"  locustio/locust --config /mnt/locust/conf/   http_10-1-1-4.conf -f /mnt/locust/senario/wp_top.py    --html /mnt/locust/result/`date "  +%Y%m%d-%H%M%S"`_http_10-1-1-4_wp_result.html 
    ```

### Grafana / Prometheus への接続

- Grafana へ接続する場合
  - 以下URLに接続する
  - http://**monitor host IP**:3000
  - ユーザ名・パスワードは、admin / admin

- Prometheus へ接続する場合
  - 以下URLに接続する
  - http://**monitor host IP**:9090



