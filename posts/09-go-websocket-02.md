---
title: '反省を活かして、EntityにGetter・Setterを用意した話'
date: '2025-04-15'
description: '反省しました'
series: 'GoでWebSocketサーバー'
pre: '08-go-websocket-01'
---

## 概要
---
せっかくなので、GetterやSetterをEntityに設けてみました。
```go
package entity

type Message struct {
	id        string // ユーザーIDを期待する
	msgType   string
	sdp       string
	candidate []string
	targetID  string
}

type WebsocketClient struct {
	id        string   
	sdp       string   
	candidate []string 
}

func NewMessage(id string, messageType string, sdp string, candidate []string, targetID string) *Message {
	return &Message{
		id:        id,
		msgType:   messageType,
		sdp:       sdp,
		candidate: candidate,
		targetID:  targetID,
	}
}

func (m Message) GetID() string {
	return m.id
}

func (m Message) GetType() string {
	return m.msgType
}

func (m Message) GetSDP() string {
	return m.sdp
}

func (m Message) GetCandidate() []string {
	return m.candidate
}

func (m Message) GetTargetID() string {
	return m.targetID
}

func (m *Message) SetID(id string) {
	m.id = id
}

func (m *Message) SetType(messageType string) {
	m.msgType = messageType
}

func (m *Message) SetSDP(sdp string) {
	m.sdp = sdp
}

func (m *Message) SetCandidate(candidate []string) {
	m.candidate = candidate
}

func (m *Message) SetTargetID(targetID string) {
	m.targetID = targetID
}

func NewWebsocketClient(id, sdp string, candidate []string) *WebsocketClient {
	return &WebsocketClient{
		id:        id,
		sdp:       sdp,
		candidate: candidate,
	}
}

func (w *WebsocketClient) GetID() string {
	return w.id
}

func (w *WebsocketClient) GetSDP() string {
	return w.sdp
}

func (w *WebsocketClient) GetCandidate() []string {
	return w.candidate
}

func (w *WebsocketClient) SetID(id string) {
	w.id = id
}

func (w *WebsocketClient) SetSDP(sdp string) {
	w.sdp = sdp
}

func (w *WebsocketClient) SetCandidate(candidate []string) {
	w.candidate = candidate
}
```
長ったらしいですね。

前回のEntityにゲッターとセッターが追加されただけです。

主に言及するのはこれによって変わったところや追加で必要になった実装などでしょうか。

## "encoding/json"直接使えない問題
---

これが今回の実装の中で唯一学びがあったところでした。

ほかは、直接書き換えをしていたところをメソッドに置き換えていくだけ。

ここも、自由な操作をしていた頃と比べて遠回りになったり、不便なように感じたりしました。

が、これは今まで**保守性に欠ける不正気味な操作をしてラクをしていた**わけで。

これがあるべき姿な、はず。

---
題目にもなっている`encoding/json`直接使えない問題は`infrastructure/service_impl`で起こりました。

もともとは、`websocket.Conn`との結合を薄くするために`adapter`的に導入しました。

後に引数を`[]byte`から`entity.Message`に変更。

usecase層から`entity.Message`を受け取ってinfrastructureの中で`encoding/json`を使って`[]byte`にしてました。

しかし、`entity.Message`の直接参照が禁止されたことで、`json.Marshal`や`json.Unmarshal`を受け取った値に直接使うことができなくなりました。

```go
func (w *WebSocketConnectionImpl) ReadMessage() (int, entity.Message, error) {
	messageType, messagebyte, err := w.conn.ReadMessageFunc()
	if err != nil {
		return 0, entity.Message{}, err
	}

	var message entity.Message
	err = json.Unmarshal(messagebyte, &message)// <--ここが失敗！！！
	if err != nil {
		return 0, entity.Message{}, err
	}


	return messageType, message, nil
}

func (w *WebSocketConnectionImpl) WriteMessage(data entity.Message) error {
	dataByte, err := json.Marshal(data)// <--ここが失敗！！！
	if err != nil {
		return err
	}
	return w.conn.WriteMessageFunc(websocket.TextMessage, dataByte)
}
```
ちなみに、`w`に含まれる`conn`は、テスト時にモックにできるに`websocket.Conn`を隠すアダプターです。

## DTOを使おう
---

この問題の解決法はズバリ、**DTOを使う**です。<-これの存在を今回の修正で知りました。お恥ずかしい

infra層にこんなものを置きます。
```go
package dto

import "example.com/webrtc-practice/internal/domain/entity"

type WebsocketMessageDTO struct {
	ID        string   `json:"id"`
	Type      string   `json:"type"`
	SDP       string   `json:"sdp"`
	Candidate []string `json:"candidate"`
	TargetID  string   `json:"target_id"`
}

func (w *WebsocketMessageDTO) ToEntity() *entity.Message {
	return entity.NewMessage(
		w.ID,
		w.Type,
		w.SDP,
		w.Candidate,
		w.TargetID,
	)
}

func (w *WebsocketMessageDTO) FromEntity(msg *entity.Message) {
	w.ID = msg.GetID()
	w.Type = msg.GetType()
	w.SDP = msg.GetSDP()
	w.Candidate = msg.GetCandidate()
	w.TargetID = msg.GetTargetID()
}
```

外部サービスに対するentiryのI/Oをお手伝いしてくれるオブジェクトです。

今回では、

```bash
websocket.Conn <--> adaptor.conn <--> service_impl.connection
                                   ↑ここ
```
ここのI/Oをお手伝いしてくれます。

適用してみましょう。
```go
func (w *WebSocketConnectionImpl) ReadMessage() (int, entity.Message, error) {
	messageType, messagebyte, err := w.conn.ReadMessageFunc()
	if err != nil {
		return 0, entity.Message{}, err
	}

	var message dto.WebsocketMessageDTO
	err = json.Unmarshal(messagebyte, &message)
	if err != nil {
		return 0, entity.Message{}, err
	}
	
	messageEntity := message.ToEntity()
	return messageType, *messageEntity, nil
}

func (w *WebSocketConnectionImpl) WriteMessage(data entity.Message) error {
	dataDTO := dto.WebsocketMessageDTO{}
	dataDTO.FromEntity(&data)
	dataByte, err := json.Marshal(dataDTO)
	if err != nil {
		return err
	}
	return w.conn.WriteMessageFunc(websocket.TextMessage, dataByte)
}
```

これで、Entityの直接参照を防いだまま、うまくservice_implを動かせるようになりました〜
