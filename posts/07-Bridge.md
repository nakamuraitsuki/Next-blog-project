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

