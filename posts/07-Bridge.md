---
title: '自宅のパソコンで立ち上げた仮想マシンを公開するまで'
date: '2025-03-13'
description: 'ホストUbuntu上でquem-kvmで仮想マシンを立ち上げ、ブリッジ接続を確立したあとVPNで外部に公開する流れの備忘録です'
---

## 概要
---
仮想マシン（VM）を立てて、外部に公開するまでにやったことを書き連ねる備忘録です。

はちゃめちゃに間違ったことを書いている可能性があります。もしご自身のPCで行う場合は入念な下調べをすることをおすすめします。

私がたどった流れを並べると以下のようになります。かなり遠回りしました。必要ない手順もありました。
1. qemu-kvmでVMをたてる **（VM特有）**
2. defaultでNATをつかう設定→bridgeでホストとVMを並列にする **（VM特有）**
3. とりあえずVMにNginxを入れてみる。
4. 外部公開を試みるも、環境が良くなくてうまく行かなそうだったので断念
5. 外部に何らかのサーバを用意（VPNサーバーにするため）
6. 外部サーバーをVPNサーバーに、VMをVPNクライアントして接続する
7. 外部サーバーの80番ポートへのアクセスをVMの80番ポートに横流しする設定

## 1. qemu-kvmで仮想マシンを構築
---
**※この章は、VMを立ち上げたい方に向けています。VMを使わず、ホストをそのまま公開する方などは飛ばしてください。**

まずは仮想マシンを立ち上げましょう。

私のホストOSはUbuntuなので、そのままターミナルで操作をしていきます。

### 必要なものをインストール

```bash qemu-kvmとvirt-managerのインストール
sudo apt update
sudo apt upgrade
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients brdge-utils
sudo apt install virt-manager
```
インストールができたら、KVMを使えるように権限付与を行います。
```bash /dev/kvmに権限付与
sudo chmod a+rw /dev/kvm
```
次に、libvirtdを起動します。
```bash libvirtdを起動
sudo systemctl enable --now libvirtd
```

### Ubuntuのisoを取得
今回はUbuntuのVMを構築します。お好きな方法でisoを取得してください。

:::linkCard
https://jp.ubuntu.com/download
:::

私はこのページからダウンロードしました。

### VM構築
次に、VMを構築します。まずは`virt-manager`起動
```bash virt-manager起動
virt-manager
```
そしたら、左上の「新しい仮想マシンの作成」を押下。
先程ダウンロードしたisoを選択して、ぽちぽち進めます。

私はネットワーク設定はデフォルトのまま進めました。いずれはブリッジにしますが。

## 2. VMをブリッジ接続
---
**※この章はVMをVPNなどを用いずに公開する場合には必須だと思いますが。VPNつかうなら正直必要ないです。**

VMのネットワーク設定はデフォルトでNATです。

NATだと外部からの接続が難しくなってしまうので、なんとかしたいところです。

対策は主に以下の２つだと思われます。
- ブリッジ接続でVMとホストを同列に扱う
- ホスト側でポートフォワーディングする

私は前者を取りました。

まずは`network-manager`を確認しましょう。
```bash
nmcli
```
もしインストールされていないようでしたら、以下のコマンドでインストールしてください。
```bash network-managerのインストール
sudo apt install network-manager
```
`network-manager`をインストールできたら、早速自分のPCのネットワークデバイスを眺めてみましょう。

```bash
sudo nmcli device show # nmcli d sでもOK
```

コネクションも眺めてみます。
```bash
sudo nmcli connection show
```

現在の自身のPCの状況を把握したら、早速ブリッジを作成していきましょう。

:::linkCard
https://runningdog.mond.jp/blog/2024/12/14/%e7%8a%ac%e3%81%a7%e3%82%82%e5%88%86%e3%81%8b%e3%82%8blinux%e3%83%8d%e3%83%83%e3%83%88%e3%83%af%e3%83%bc%e3%82%af%e8%a8%ad%e5%ae%9a-3-%e4%bb%ae%e6%83%b3%e3%83%96%e3%83%aa%e3%83%83%e3%82%b8/
:::

このサイトを参考にしたりしながらやりました。

先ほど紹介した一覧表示コマンドを駆使して、ブリッジを割り当てるIPアドレスを決めます。（以下では、そのIPアドレスが`192.168.xx.xx`であるとして書きます）

もともとそこにつながっていたものは、ブリッジとつなげて間接的にそこにつながっている状態にします。

手順をこなすごとに`nmcli c s`で今どういう状態になっているのか確認するのがおすすめです。

まずブリッジを作りました。
```bash bridge作成
nmcli connection add type bridge con-name br0 ifname br0
```
`br0`はただのお名前なので、`bridge`とか`br1`とかでも大きな問題はないでしょう。

作り終わったら、状態を確認。
```bash bridgeの存在を確認
nmcli c s
```
できたら、今作った`br0`に設定を追記していきます。

なお、設定の状態は
```bash
nmcli device show br0
```
で見られます。

基本は先程あげたサイト通りです。
まずは最初に見定めたIPアドレスを設定
```bash IP割当て
nmcli connection modify br0 ipv4.method manual
nmcli connection modify br0 ipv4.addresses 192.168.xx.xx
```

次に、ゲートウェイ設定をします。要は出入り口のことで、私の場合は自宅のルーターがそれに該当します。

```bash ルート確認
ip route
```
で、`default`のIPアドレスをゲートウェイとして追加します。
```bash ゲートウェイ設定
nmcli connection modify br0 ipv4.gateway なんたらかんたら
```
DNSもルーターにします。
```bash DNS設定
nmcli connection modify br0 ipv4.dns なんたらかんたら
```
次に、スパニングツリーを無効もともとそこにつながっていたものは、ブリッジとつなげて間接的にそこにつながっている状態にします。にします。これは送信データのループを防ぐためのものですが、記事によると単独ブリッジの場合には不要とのこと。
```bash スパニングツリー無効化
nmcli connection modify br0 bridge.stp no
```
ちなみに`stp`というのはスパニングツリーのプロトコルの一種です。

もしこのあたりでネットが繋がらなくなったら、スパニングツリーを有効化しましょう。

次は、
> もともとそこにつながっていたものは、ブリッジとつなげて間接的にそこにつながっている状態にします。

これをやります。

```bash 
nmcli connection add type ethernet con-name br-slave-[もともとそこにいたコネクション] ifname [もともそそこにいたコネクション] master br0
```
これによって、もともとそこにあった接続を、`br0`をマスターとするスレイブとして追加することができました。

では、もともとあった接続をoffにして、今作ったbridgeとslaveをonにしましょう。

```bash 有効化
nmcli connection down [もともとあったコネクション名]
nmcli connection up br-slave-[もともとあったコネクション名]
nmcli connection up br0
```

一連の操作が終わったら、ちゃんと接続がなされているか確認してみましょう。
```bash
nmcli c s
```
どうですか、できてますか。

成功していた方、おめでとうございます。

しかし、まだ終わりではありません。VMをこのブリッジに繋げなくてはならないのです。

でも、この手順はめちゃめちゃかんたん。
`virt-manager`のGUIをポチポチやればすぐですよ。

まず、仮想マシンを「開く」していただいて、その画面の「仮想マシン（M）」の詳細を表示。

NICをみて、仮想ネットワークインターフェースのネットワークソースをブリッジデバイスに、デバイス名を先程設定したブリッジに（今回なら`br0`）。

これでVMのブリッジ接続が完了しました。

試しにVMを立ち上げて、VMのなかで
```bash
ip a
```
してみてください。
ホストOSとは別のIPアドレスがちゃんと振り分けられているのが確認できるかと思います。

ここまでできたら完璧！

VMがホストOSと同列になりました。

## 3. とりあえずVMにNginxを入れてみる
ここの章はほんとにいらんですね。
表示確認用に、80番ポートにアクセスが来たときにNginxのデフォルトページが表示されれば便利かなと思って入れました。

VMの中にNginxを入れます。
```bash
sudo apt install nginx
```
で、入れたらとりあえず状態を確認
```bash
sudo systemctl status nginx
```
良さそうなら有効化
```bash
sudo systemctl enable nginx
```
あとは、`http://[VMに割り当てられているIPアドレス]`にアクセス。Nginxのデフォルトページが見れるでしょう。