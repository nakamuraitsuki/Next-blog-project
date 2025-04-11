---
title: 'WebSocketサーバーをGoで動かす(1)'
date: '2025-04-12'
description: 'レイヤードアーキテクチャを意識しながら、GoでWebSocketサーバー設計をやってみる'
series: 'GoでWebSocketサーバー'
---

## 概要
---
私は個人的にwebRTCに興味がありましたので、その第一段階としてWebSocketによるシグナリングに着目。

すでにネットに公開されているコードをレイヤードアーキテクチャに落とし込むことで、どこが何を担って、どのように情報のやり取りをしているか掴めるのではないかと考えました。

せっかくレイヤーごとに切り分けたので、testも書いてみました。

:::linkCard
https://zenn.dev/fog/articles/cf796ab135615e
:::

こちらの記事には大変お世話になりました。

また、記事にすべてのコードを乗せることはできません。（非常に細かく分割されているので）

もし、見たい方は以下のURIからどうぞ

:::linkCard
https://github.com/nakamuraitsuki/webrtc-practice/tree/feat/websocket-server
:::

本記事では、主にdomain層について振り返りたいと思います。

## domain/entity
---
### 実装
まずはコードの紹介から。このあたりはまだ記事に載せられます。
```go
package entity

type Message struct {
	ID        string  `json:"id"` // ユーザーIDを期待する
	Type      string  `json:"type"`
	SDP       string `json:"sdp"`
	Candidate []string `json:"candidate"`
	TargetID  string `json:"target_id"`
}

type WebsocketClient struct {
	ID        string   `json:"id"`
	SDP       string  `json:"sdp"`
	Candidate []string  `json:"candidate"`
}

func NewMessage(id string, messageType string, sdp string, candidate []string, targetID string) *Message {
	return &Message{
		ID:        id,
		Type:      messageType,
		SDP:       sdp,
		Candidate: candidate,
		TargetID:  targetID,
	}
}

func NewWebsocketClient(id, sdp string, candidate []string) *WebsocketClient {
	return &WebsocketClient{
		ID:        id,
		SDP:       sdp,
		Candidate: candidate,
	}
}

```

`Message`はその名の通りWebSocketでやり取りするメッセージです。

この部分を差し替えることで、チャット用のサーバーに変容することもできますね。

`Message`にSDPやICE Candidateをのせて上げることで、WebRTCのやり取りの準備をします。

`WebsocketClient`もその名前のままですね。それぞれのクライアントの情報です。

本当は外部から直接参照できないようにするのが良いのかもしれません。今後の課題です。

### テスト
まずはコードの紹介から。
```go
package entity_test

import (
	"testing"

	"example.com/webrtc-practice/internal/domain/entity"
	"github.com/stretchr/testify/assert"
)

func TestNewMessage(t *testing.T) {
	id := "user123"
	messageType := "offer"
	sdp := "sdp data"
	candidate := []string{"candidate1", "candidate2"}
	targetID := "target456"

	message := entity.NewMessage(id, messageType, sdp, candidate, targetID)

	assert.Equal(t, id, message.ID)
	assert.Equal(t, messageType, message.Type)
	assert.Equal(t, sdp, message.SDP)
	assert.Equal(t, candidate, message.Candidate)
	assert.Equal(t, targetID, message.TargetID)
}

func TestNewWebsocketClient(t *testing.T) {
	id := "user123"
	sdp := "sdp data"
	candidate := []string{"candidate1", "candidate2"}

	client := entity.NewWebsocketClient(id, sdp, candidate)

	assert.Equal(t, id, client.ID)
	assert.Equal(t, sdp, client.SDP)
	assert.Equal(t, candidate, client.Candidate)
}
```
実態がちゃんと作成できることだけ確かめられればよかったので、非常に簡素なテストになっています。

少しぶっちゃけた話をすると、のちの開発で実態とポインタが入り混じってしまい、最終的に実態を直接作るようにしたので、このファクトリ関数がここ以外で使われることは今のところありません。

これも今回の大きな反省点の一つです。

## domain/repository
---
コード紹介
```go
package repository

type IWebsocketRepository interface {
	CreateClient(id string) error
	DeleteClient(id string) error
	SaveSDP(id string, sdp string) error
	GetSDPByID(id string) (string, error)
	SaveCandidate(id string, candidate []string) error
	AddCandidate(id string, candidate []string) error
	ExistsCandidateByID(id string) bool
	GetCandidatesByID(id string) ([]string, error)
}
```
これだけです。

基本的に情報の登録・追加と、そもそも入っているかの確認だけです（情報のあるなしでやり取りする内容に分岐が生じるはず…）

先程の`domain/entity`の`WebsocketClient`の永続化に使われます。

ただのinterfaceなので、テストは書いていません。

## domain/service
---
基本的に、外部の技術＋αの実装が必要そうなものはここにインターフェースとしてまとめたりしました。

とりあえず、mock化のときに必要なadapterと、直接依存を避けたいfactoryだけ切り出して、残りはdomain/serviceに置いてるイメージ感です。

反省点です。

### offer_service
```go
package service

type OfferService interface {
	SetOffer(id string)
	GetOffer() string
	ClearOffer()
	IsOffer() bool
	IsOfferID(id string) bool
}
```
現在のWebSocketサーバーは基本的に一つの接続成り立たせることに特化しているので、ひとりのofferを保存しておくサービスです。

ここをRoomIDマネージャーに差し替えたりすれば部屋を作って通信する、みたいなこともできるのかなと思っていますが、どうなんでしょうか。

### broadcast
```go
package service

import "example.com/webrtc-practice/internal/domain/entity"

type WebSocketBroadcastService interface {
	Send(message entity.Message)
	Receive() entity.Message
}
```
メッセージのやり取りを行うパイプラインです。

基本的にサーバーとクライアントは接続されているので、その２つの接続間のメッセージの中継が主な役割です。

RoomID制にするなら、ここも差し替えの必要がありそうです。

部屋ごとにゴルーチンを回して、それぞれに対するやり取り要因としてこれを使う形になるでしょうか。

### websocket_manager
```go
package service

import "example.com/webrtc-practice/internal/domain/entity"

type WebSocketConnection interface {
	ReadMessage() (int, entity.Message, error)
	WriteMessage(entity.Message) error
	Close() error
}

type WebsocketManager interface {
	RegisterConnection(conn WebSocketConnection) error
	RegisterID(conn WebSocketConnection, id string) error
	DeleteConnection(conn WebSocketConnection) error
	GetConnectionByID(id string) (WebSocketConnection, error)
	ExistsByID(id string) bool
}
```
コネクションの管理を行うマネージャーです。

1. とりあえずリクエストをコネクションにアップグレードして、登録
2. 初回のメッセージでIDを特定、登録
3. for文を回してメッセージ待機

を想定した作りになっています。

`WebSocketConnectio`って、ただのAdapterじゃないの？と思われるかもしれません。

いちおうwebsocket関連の接続では`[]byte`やり取りがメインのところを、`entiry.Message`の受け入れに変換しているという点で`domain/service`味があるかな…と思ってここに置いています。

この辺のやり方をきちんと整理できていないのも今回の反省点の一つです。

ドメイン層は以上！！！

## まとめ
---
domain層は反省点ばかりです。

システムの根幹を担うdomain層が反省点ばかりということは、この先の層も非常に多くの反省点があるということになります。

（反省点が伝播していっています）

途中で記事を書くことに飽きないよう、ちまちま反省していきます。

私の失敗がいつかなにかの役に立てばと願ってやみません。
