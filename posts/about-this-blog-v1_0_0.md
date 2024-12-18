---
title: 'Markdownで記事を書けるブログをNext.jsで作った話'
date: '2024-12-17'
description: '記事を書いて、見せることができるブログを作ってみました。その開発中に学んだことや詰まったことをまとめてみました。'
---

## 概要
---
この『しゃべる葦原』というブログサイトを作る手順を振り返りながら、学んだことや気になったことをまとめてみようと思っています。

「ここ、いまだによくわからんなぁ」とか、「この実装は冗長だなぁ」とかいう気持ちをアウトプットするつもり。

## ブログを作ろうと思った経緯
---
**ISUCONの参加記を書きたかったから**の一言に尽きます。

ISUCON14の中で、たくさん学び、たくさん感情が動きました。

「なんだかんだ楽しかったなぁ。来年も参加したいな。」などとぼんやり思っていたら、あっという間にISUCON14は一週間前の出来事に。

このままでは、いま感じているこの感情たちも色褪せてしまう。きっといつか忘れてしまう。危機感を覚えた私は参加記を残すことに決めます。

じゃあ、どこに参加記を残そうか。そうだ、ブログを作ろう！

そうしてこのブログが誕生しました。

## 1.何を使ってブログを作るか？
---
最初にやったのは **「どうやってブログを作るか？」** を考えることです。

あーだこーだ考えた結果、結局Next+Markdownという形に落ち着きました。採択理由は、私の所属している[サークルのブログ](https://blog.maximum.vc/)でも採用されている形式で、なじみがあったためです。

開発方法を調べている中で、**Astro**というものを知ったので、少しまとめておきます。

### Astroってなんだ？
---
![Astro](https://astro.build/assets/press/astro-logo-dark.svg)

[Astro](https://kakaku-techblog.com/entry/create-website-with-astro)
とは、 **SSG(Static Site Generator)** のフレームワークの1つで、非常に高速であることが特徴らしいです。

その高速性は **MPA(Multi Page Application)** を採用していて、ビルド時に生成されるファイルにJavaScriptが含まれていないことが所以らしい。

>MPA(Multi Page Application)というのは簡単に言うと、ページごとにhtmlファイルがあるアプリケーションのことです。
>このブログで例えるならば、ホーム画面用のhtml、aboutページ用のhtml、記事ページ用のhtmlがそれぞれある感じ。

一方、NextのSSGモードでは **SPA(Single Page Application)** が採用されています。

>SPA(Single Page Application)というのは簡単に言うと、htmlは1つしかなくて、ページ遷移はJavaScriptで差し替えることで実現するアプリケーションのことです。

SPAはJavaScriptで差し替えをしているので、**ページ遷移がかなり高速**です。しかし、1つのhtmlファイルとJavaScriptファイルでサイトを実現するために、**初回の読み込みが遅くなる**というデメリットがあります。

一方MPAは膨大なJavaScriptを読み込む必要がないので、**サイトが高速になります**。ですが、素朴にページ遷移を行うために**ページ移動は少し遅くなります**。

#### Astroのその他メリット
確かに高速であることも大きなメリットですが、私個人としてはそれ以上に心惹かれる要素がAstroにはありました。

それは**markdownの扱いがとてもカンタンそうだった**ことです。軽く調べただけですが、[この記事](https://docs.astro.build/ja/tutorial/2-pages/2/)とかを見ると、すごくラクそう！

#### なぜAstroを選ばなかったのか
ここまでの記述を見ると、このブログで実現したいことはすべてAstroで実現できそうです。

それなのに、なぜNextの方を採用したかというと、**そちらの方がなれているから**です。

~~精神的向上心のない発言ですが、どうか許して…~~

そもそもこのブログを作る目的は **『感情が薄れる前にISUCON参加記を書く』** なので、``.astro``を新しく学んで導入するよりも、慣れているJSXの書き方でやったほうが素早くできるのではないかと考えたのです。

じゃあ、実際に素早く開発できたの？　と言われると、ちょっと…

![initial-commit](/article/about-this-blog-v1_0_0/1.png)

「よし、ブログを作ろう」と思い至ってリポジトリを作ってプロジェクトを始めたのが12月12日。ブログ公開と同時にISUCON参加記も上げたので、公開日が12月16日。**最低限の機能をつけるのに4日かかっています。**

Nextだからこの日数なのでしょうか。Astroだったらもっと時間がかかっていたでしょうか。**いいやそんなことはない。（反語）**

NextでMarkdownを扱うには**ファイルを取得するロジックや、remarkなどの導入が必要**で、このあたりで少し苦戦しました。Astroでやればスキップできた工程です。

結局苦戦するなら、Astroでよかったかなぁ…　と思ったりして。

## 2.Nextプロジェクトの作成
---
[このサイト](https://nextjs-ja-translation-docs.vercel.app/docs/getting-started)とかを参考に、プロジェクトを作成しました。

コマンド1つで自動セットアップ！
```bash
npx create-next-app@latest
```

このコマンドを打つと、さっそく質問攻めに遭うことに。

```bash
? What is your project named?
```

名前…``my-blog``とかでいいや。

```bash
? Would you like to use TypeScript? › No / Yes
```

TypeScriptかぁ。使うかも。Yseっと。

```bash
? Would you like to use ESLint? › No / Yes
```

ESLint…　サークルのpublic-website開発に参加させてもらったときにたくさんお世話になった記憶があります。とりあえずYes。

```bash
? Would you like to use Tailwind CSS? › No / Yes
```

**Tailwind CSS**ってなんだ？　

私の今までの開発の中ではCSS Modulesを使うことがほとんどだったので、知らない子が出てきて困惑しました。調べた結果をちょっとまとめてみます。

### Tailwind CSSとは
---
[Taliwind CSS](https://tailwindcss.com/)はCSSフレームワークの１つ。ユーティリティクラスと呼ばれるものをクラスの中に書くことで手軽にCSSを当てることができるようです。自由度が高く、CSSを書く必要がないという事で重宝する人もいるとか。

調べてたら、Tailwind CSSを論理的に激推しする記事と、それに対してModule CSSもありじゃない？と反駁する記事がありました。興味深い記事だったので、是非読んでみてほしい。

---
Tailwind CSSは慣れるのに時間を食いそうな予感。Astroを使わなかったのと同様の理由で導入はしませんでした。

```bash
? Would you like your code inside a `src/` directory? › No / Yes
```

``/src``にまとまってた方が嬉しいのでYes。

```bash
? Would you like to use App Router? (recommended) › No / Yes
```

App Routerって何だ？　なんかおすすめらしいです。

ちょっと調べてみたのですが、これがやけに複雑で…

デフォルトの選択肢がYesなのでYesにしちゃいましたが、導入の必要はなかったかもしれないなと感じています。手に余るものを入れてしまったという印象。

[公式ドキュメント](https://nextjs.org/docs)

```bash
? Would you like to use Turbopack for `next dev`? › No / Yes
```
## Turbopackとは
---
Turbopackというのは、Webpackに代わるバンドラーらしいです。

TypeScriptやJavaScriptが最適化されていて、起動が早いらしい。

---
とりあえずYesにしておきました。

```bash
? Would you like to customize the import alias (`@/*` by default)? › No / Yes
```
デフォルトのインポートエイリアスを変えたいかと聞かれました。

### インポートエイリアスとは
---
関数やコンポーネントを他のファイルから引っ張ってきたいときに
```JavaScript
import Card from "../../components/Card"
```
みたいに書いたりしますが、ファイル分割をたくさんすることで、相対パスを書くのが面倒になったりします。

インポートエイリアスでは、``@/``をルートディレクトリとすることで、楽にパスを書ける機能のことです。

```JavaScript
import Card from "@/src/app/component/Card"
```
みたいな感じ。

---
インポートエイリアスは変えないのでNoとします。

**以上でNextのプロジェクトの作成が完了しました!**

結局すべてデフォルトの選択肢に落ち着きましたね。
