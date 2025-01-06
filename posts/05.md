---
title: 'リンクカードを実装した話'
date: '2025-01-02'
description: 'URLを元にメタデータを取得して表示できるようにしました'
---

## 概要
---
以前tweet記法を追加しましたが、同じ方法を使えばリンクカードを導入できるのではないかと考えたのが始まりです。

[このサイト](https://ashihara.vercel.app/)

と書くよりも、

:::linkCard
https://ashihara.vercel.app/
:::

となっていた方が見やすい場面が多々ありますね。技術ブログなどでもよく採用されている方式です。

## 実装方法について調べる
---

プログラマとしては良くないのかもしれませんが、まずは **chatGPT** に問いかけてみます。

**『現在、Markdownの記事からリンクカードを表示したいと思っています。URLを元にメタデータを取得する関数を作るために必要な技術を教えてください』**

すると、次のような情報が返ってきました。

---

- **Markdown中のURLを抽出**...Markdownテキストを解析し、URLをリスト化。

- **バックエンドでURLからメタデータを取得**...HTTPリクエストでHTMLを取得し、OGPやメタタグを解析。

- **取得データをフロントエンドに渡す**...API経由でメタデータ（タイトル、説明、画像URL）を返却。

- **リンクカードをフロントエンドで表示**...カードUIコンポーネントに取得したデータを渡し、レンダリング。

---

また、フロントエンドだけで取得を行おうとすると **CORSエラー** が発生する可能性があることも示唆されていました。

CORSかぁ…GOで個人開発をした時にはヘッダーを設定するミドルウェアで管理していたような記憶があります。Nextではどのようにやるのでしょうか。

ここまで情報が手に入ったらググりに行ってもいいのですが、もう少しchatGPTにお世話になりましょう。

**『Next.jsで作っています。CORSエラーを回避したいです』**

すると、以下のキーワードを教えてくれました。

- **Next.js API Routesでプロキシを作成**

- **外部CORSプロキシを利用する**

これらの情報を元に、記事や公式ドキュメントを漁りに行きます。

## NextのAPI Routesでプロキシを作成する
---
この記事が非常に役に立ちます。というかほとんどそのままです。

:::linkCard
https://zenn.dev/tm35/articles/27be33a239a687
:::

プロキシサーバーを使うことで、CORSエラーを吐かずに情報を取得することができます。

ただし、先ほど載せた記事はおそらくNext.jsのPageRouterについての話をしていて、
今私のサイトが導入しているAppRouetrでは細かな部分を少し変える必要があります。

という事で、先ほどの記事と、公式ドキュメントを参考に実装をしていきます。

:::linkCard
https://nextjs.org/docs/app/building-your-application/routing/route-handlers
:::

AppRouetrになってからルーティングが変わって、``src/app/api/route.ts``と書くと、``/api``をエンドポイントとしたあれこれが書けるようになっています。

:::tweet
公式ドキュメントの中でもPageRouterについてのものとAppRouterについてのものが共存していて、
とっても混乱しました。何とかならんもんかね
:::

今回は、``/app/api/proxy/route.ts``とかに色々書き込んでみます。

```ts /app/api/proxy/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const searchParams = req.nextUrl.searchParams;
        const url = searchParams.get('url');
    
        if(url === null) {
            console.log("error: proxy");
            return Response.json({status: 500});
        }
    
        const response = await fetch(url, {
            headers: { 'Content-Type': 'text/html'}
        });
    
        const html = await response.text();
        return new Response(html, {
            status: response.status
        });
    } catch (error) {
        console.log(error);
        return Response.json({status: 500});
    }
}
```
大雑把な流れは、
1. NextRequest型のリクエストを受け取る

2. リクエストを元にfetchする

3. 戻ってきた情報をRequest型で返す

です。

[Nextの公式ドキュメント](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)で紹介されている
``NextRequest``と``NextResponse``は、もともとある``Request``と``Response``を拡張したものらしいので、わざわざ導入しなくてもいいかな、という感じ。

ただ、公式ドキュメントに``NextResponse``を使うと簡単にクエリパラメータを取得できると書いてあったので導入してみました。

後は、取得したクエリパラメータ（今回は情報を取ってきたいURL）を使ってfetchしていきます。

```ts
const response = await fetch(url, {
    headers: { 'Content-Type': 'text/html'}
});

const html = await response.text();
return new Response(html, {
    status: response.status
});
```
ヘッダーを設定していますが。わざわざする必要はありません。

欲しい情報はhtmlとレスポンスステータスだけなので、htmlをtextとして処理して、それ以外は捨ててます。

これでプロキシに書くべきことはすべて書けました。

## getOGP関数を作成
---
プロキシを作れたので、プロキシにリクエストを飛ばして、返答を上手く処理する関数を作ります。

関数に必要な機能を整理しておきます。
- urlを引数にとって、そのurlの情報を取得しに行く（プロキシ活用）

- 返答を処理して必要なメタデータだけにする

- メタデータを返す

さっそく実装します。
まず、引数を使って取得しに行くところから
```ts /src/lib/fetch/ogp.ts
export const getOGP = async (url: string) => {
    const proxyUrl = process.env.API_PROXY_URL; //proxyサーバーURL
    const result = await fetch(`${proxyUrl}?url=${url}`); //パラメータを付与してリクエスト
    const html = await result.text(); //testで処理
}
```
こんな感じ。

URLのところで、環境変数を使うようにしてみました。

### 環境変数をつかう
---
プロキシのURLって、ローカルで動かしてるときと本番環境で動かしてる時で違くなっちゃいますよね。

ローカルの時は、``localhost:なんたら番/api/proxy``で、本番環境は``本番のURL/api/proxy``になります。

ここを **環境変数で管理出来たらかっこいい** かなって思ったので、やってみます。

:::linkCard
https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
:::

これが参考になりました。

``/env.local``を作って、その中に環境変数を書き込みます。たとえば
```bash
API_PROXY_URL=http://localhost:なんたら番/api/proxy
```
こんな感じ。

で、使うときはこんな感じで読みだす。
```ts
const proxyUrl = process.env.API_PROXY_URL; //proxyサーバーURL
```
本番環境の環境変数は、デプロイの仕方によって設定方法が変わるので何とか頑張ります。

私はVercelを使っているので、

:::linkCard
https://zenn.dev/no215/articles/d0585982ba1116
:::

こちらの記事を参考にやりました。

### メタデータを取り出す
---
先ほど結果として受け取った``html``は、本当にすべてのhtmlを持っています。

本文とかも含めて、全部。

僕らが本当に欲しいのはその膨大なhtmlの中の一握り、メタデータ・ogpだけです。

そこで、それだけを取り出す処理をしましょう。

調べている感じだと、[jsdom](https://github.com/jsdom/jsdom)を使う、[cheerio](https://github.com/cheeriojs/cheerio)を使うなど複数の手段がありそうでした。

jsdomはES Moduleの書き方が公式ドキュメントになかったので、cheerioの方を採用しました。

:::linkCard
https://github.com/cheeriojs/cheerio
:::

```ts
const $ = cheerio.load(html);

const ogTitle = $('meta[property="og:title"]').attr('content') ?? $('title').text();
const ogDescription = $('meta[property="og:description"]').attr('content');
const ogImageUrl = $('meta[property="og:image"]').attr('content');
```
こんな感じ

ogにタイトルが無いときには、タイトルタグを取ってくるようにしてます。

そして、少し今後の設計の話。

データが無いときどうする？という話です。TypeScriptだと、そういう場合が考えらるときには型にundefinedが
入ってきちゃうんですよね。

そこで、そもそもメタデータにimageがなかったりするときには、デフォルトの出力をするように前処理をしておきます。

```ts
const ogTitle = $('meta[property="og:title"]').attr('content') ?? $('title').text() ?? "Untitled Page";
const ogDescription = $('meta[property="og:description"]').attr('content') ?? "";
const ogImageUrl = $('meta[property="og:image"]').attr('content') ?? null;
```

こんな感じ。

### まとめて返す
---
今後扱い易いように、``ogpData``型を用意しておきましょう。

```ts /src/lib/type/ogp.ts
//メタデータセットの型
export interface ogpData {
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string | null;//TODO:nullの場合にはデフォルトアイコンを表示するようにする
}
```
TODOにも書いてありますが、nullの時にはデフォルトアイコンを表示する処理が必要そうですね。

では、この型を使って関数を完成させましょう。

```ts /src/lib/fetch/ogp.ts
import * as cheerio from 'cheerio';
import { ogpData } from '../type';

export const getOGP = async (url: string): Promise<ogpData> => {
    try {
        const proxyUrl = process.env.API_PROXY_URL; //proxyサーバーURL
        const result = await fetch(`${proxyUrl}?url=${url}`); //リクエスト飛ばす
        const html = await result.text(); //testで処理
    
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content') ?? $('title').text() ?? "Untitled Page";
        const ogDescription = $('meta[property="og:description"]').attr('content') ?? "";
        const ogImageUrl = $('meta[property="og:image"]').attr('content') ?? null;
        const res: ogpData = { ogTitle, ogDescription, ogImageUrl }
        return res;
    } catch (error) {
        console.log(error);
        return {
            ogTitle: "Error",
            ogDescription: "No description available",
            ogImageUrl: null
        }
    }
}
```
**これにて完成！！**

## linkCard記法作成
---
Markdownの中に直接URLを書いたら勝手にカードになるようにしても良いのですが、せっかく以前記法を作れるようにしたので、
 **独自の記法を作ってみます。**

以前の記事↓

:::linkCard
https://ashihara.vercel.app/blog/pulugIn
:::

正直流れは全く同じなので、ざっくり書いていきます。

### 記法を決める
---
```md
:::linkCard
url
:::
```
これで行こう。
### 型定義
---
まずはASTを確認。
```bash
├─3 paragraph[3] (5:1-7:4, 123-199)
│   ├─0 text ":::linkCard\n" (5:1-6:1, 123-135)
│   ├─1 link[1] (6:1-6:61, 135-195)
│   │   │ title: null
│   │   │ url: "https://www.youtube.com/live/FksSCH9FYqI?si=lJGFBpmxPMT-OdS2"
│   │   └─0 text "https://www.youtube.com/live/FksSCH9FYqI?si=lJGFBpmxPMT-OdS2" (6:1-6:61, 135-195)
│   └─2 text "\n:::" (6:61-7:4, 195-199)
```
どうやら、直接URLを書くだけでLinkというNodeになるみたい。

この記法で書かれたLinkを **linkNode** という独自ノードにしましょう。

独自ノードの定義を``/src/lib/type/linkCard.ts``に書きます。
```ts /src/lib/type/linkCard.ts
//linkCard用のNode
export interface LinkCardNode extends Node {
    type: 'linkCard';
    url: string;
}
```

### ノード変換プラグイン
---
Markdownからmdastにする時にLinkCardNodeにするプラグインを作ります。

まずは、記法を判定する関数から。
```ts /src/lib/markdown/utils/linkCardUtils.ts
const LINK_CARD_BEGGINING = ":::linkCard\n";
const LINK_CARD_ENDING = "\n:::";

export function isLinkCard(node: unknown): node is Paragraph {
    //paragraphじゃなかったらLinkCardでもない
    if (!isParagraph(node)) {
        return false;
    }

    //分割代入によってchildrenプロパティを抽出
    const { children } = node;

    //子要素はLinkとそれを挟むテキストのみ
    if(children.length !== 3 || !isLink(children[1])){
        return false;
    }

    //":::linkCard\nで始まっていなかったらlinkCard記法じゃない"
    const firstChild = children[0];
    if (!(isText(firstChild) && firstChild.value.startsWith(LINK_CARD_BEGGINING))) {
        return false;
    }

    //":::\nで終わってなかったらlinkCard記法じゃない"
    const lastChild = children[children.length -1];
    if (!(isText(lastChild) && lastChild.value.endsWith(LINK_CARD_ENDING))) {
        return false;
    }

    return true;
}
```
この記法判定関数が、LinkCardNodeの定義そのものにもなります。

先ほどのASTを元に条件を設けています。

1. パラグラフノードである

2. 記法が使われている。

3. 「:::linkCard\n」＋「URL」＋「:::\n」の構成である

この``isLinkCard``を使ってプラグインを作ります。
```ts linkCardPlugin.ts
import { Plugin } from "unified";
import { Node, Parent } from "unist";
import { Paragraph, Link } from "mdast";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
import { LinkCardNode } from "@/lib/type";
import { isParent, isLink, isLinkCard } from "../utils";

export const linkCardPlugin: Plugin<[], Node, void> = () => {
    return (tree: Node, _file: VFile) => {
        //treeのlinkCard記法を訪れた時に、変換処理をする。
        visit(tree, isLinkCard, (node: Paragraph, index: number | undefined, parent: Parent | undefined ) => {
            if (!isParent(parent) || typeof index !== "number" || !isLink(node.children[1])) {
                return;
            }

            const children: Link = node.children[1];
            const url: string = children.url;

            parent.children[index] = {
                type: "linkCard",
                url,
            } as LinkCardNode;
        })
    }
}
```

### ノード→class付きaタグ変換
---
これは、remarkRehypeに新しい変換定義を与えるだけでok

定義関数を書きます。
```ts linkCardUtils.ts
export const linkCardHandler: Handler = (_h: State, node: LinkCardNode) => {
    return {
        type: "element",
        tagName: "a",
        properties: {
            href: node.url,
            className: ["linkCard"],
        },
        children: []
      };
}
```
これをremarkRehypeに渡します。（渡し方は最後の完成状態の時に…）

### class付きdiv→JSXコンポーネント
---
これもrehypeReactに定義を渡すだけ

定義関数を書きます。
```ts aHandler.tsx
import { Components } from "rehype-react";
import { JSX } from "react";
import { ExtraProps } from "hast-util-to-jsx-runtime";
import { LinkCard } from "@/components";

export const aHandler: Components['a'] = (props: JSX.IntrinsicElements['a'] & ExtraProps): JSX.Element => {
    //分割代入で展開
    const { node, className, href, ...restProps } = props;

    if (className === 'linkCard') {
        const url = href ?? null;
        return <LinkCard href={url}/>;
    }

    return <a {...restProps} />;
};
```

### プラグインを導入してまとめる。
---
今まで作ってきたプラグインを使います。

まず、Nodes型を拡張して警告を回避。``/src/lib/type/nodes.ts``に書きます。
```ts nodes.ts
import { TweetNode, LinkCardNode } from "../type"

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
        linkCard: LinkCardNode;//LinkCardNodeを許容するよう設定
    }
}
```
あとは、今まで書いてきたプラグインやハンドラを組み込むだけです。
```ts markdown.ts
interface MarkdownContent {
    toc: TableOfContentsItem[];
    JSXElement: JSX.Element;
}

//remarkRehypeに渡すカスタムハンドラ
const remarkRehypeHandlers: Partial<Record<Nodes['type'], Handler>> = {
    tweet: tweetHandler, //tweetNodeに対する処理を定義
    linkCard: linkCardHandler, //linkCardに対する処理を定義
};

//remarkReactに渡すカスタムハンドラ
const rehypeReactHandlers: Partial<Components> = {
    div: divHandler, //divにclassを付与するタイプのカスタム
    a: aHandler, //aにclassを付与するタイプのカスタム
}

export async function markdownToJSX(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　JSX
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(tweetPlugin)
    .use(linkCardPlugin)
    .use(remarkGfm)
    .use(remarkRehype, { handlers: remarkRehypeHandlers })
    .use(rehypeHighlight)
    .use(rehypeSlug)//id付与
    .use(rehypeReact,{
        Fragment,
        jsx,
        jsxs,
        components: rehypeReactHandlers
    })
    .process(content);

    return {
        toc: tableOfContents,
        JSXElement: result.result
    };
}
```
**完成！**

## LinkCardコンポーネント作成
---
このコンポーネントの機能をまとめておきます。
- パラメータとしてurlを受け取る

- urlをもとにgetOGP関数を使ってメタデータを取る

- カードとして表示する

これを加味して実装しました。
```ts LinkCard.tsx
import styles from "./LInkCard.module.css"
import { getOGP } from "@/lib";
import { ogpData } from "@/lib";
import Link from "next/link";
import { FaImage } from "react-icons/fa";

interface LinkCardProps {
    href: string | null;
}

export const LinkCard = async ({ href }: LinkCardProps) => {
    //hrefが空の場合
    if ( href === null ) {
        return (
            <div>
                Not Fount
            </div>
        )
    }

    const ogpDate: ogpData = await getOGP(href);

    return(
        <Link href={href} className={styles.LinkCard}>
            <div className={styles.flex}>
                <div className={styles.ogText}>
                    <p className={styles.ogTitle}>{ogpDate.ogTitle}</p>
                    <p className={styles.ogDescription}>{ogpDate.ogDescription}</p>
                </div>
                {ogpDate.ogImageUrl ? (
                    <div className={styles.imgWrap}>
                        <img
                        src={ogpDate.ogImageUrl} 
                        alt="OG Image" 
                        className={styles.img}
                        />
                    </div>
                ) : (
                    <FaImage size={40} />
                )}
            </div>
        </Link>
    )
}
```
先述した画像がない場合には、react-iconsのそれっぽい画像を表示するようにしました。

:::linkCard
https://www.npmjs.com/package/react-icons
:::

次にCSSを当てていきます。

:::tweet
設計をよく考えてなかったせいでCSSModulesでやってるのに競合が起こっちゃった。!importantでなんとかしたけれど
いつかもっとうまくやる方法を模索した方がいいかも
:::

```css LinkCard.module.css
.LinkCard {
    margin: 24px 0;
    display: block;
    /*!importntしないと.markdown aのオーバーライドを逃れられない*/
    text-decoration: none !important;
    color: #000000 !important;
    width: 100%;
    height: 140px;
    padding: 0;
    background-color: #ffffff;
    border-radius: 8px;
    border: 1px solid #eee2bc;
}

@media(prefers-color-scheme: dark) {
    .LinkCard {
        background-color: #1e1e1e;
        border: 1px solid #f3d500;
    }
}

.flex {
    display: flex;
    justify-content: space-between;
}

.ogText {
    flex: 1;
    margin: 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}

.ogTitle {
    margin: 0;
    font-weight: bold;
    color: #6f5d00;
    height: 40px;
    font-size: 1.125rem !important;/*.markdown pのオーバーライド回避*/
    line-height: 1.25rem !important;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (prefers-color-scheme: dark) {
    .ogTitle {
        color: #f3d500;
    }
}

.ogDescription {
    margin: 0;
    height:64px;
    font-size: 0.875rem !important;
    line-height: 1rem !important;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (prefers-color-scheme: dark) {
    .ogDescription {
        color: #cccccc; /* 説明文の色を調整 */
    }
}

@media (max-width: 767px) {
    .imgWrap {
        display: none;
    }
}

.img{
    margin: 0 !important;
    width: auto !important;
    height: 138px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}
```

**これにて完成！！**

## まとめ
---
1. プロキシ作成
2. メタデータ取得関数作成
3. 新記法導入
4. 取得関数を使ってコンポーネントで表示

の流れで実装しました。

ただ、まだ見た目や挙動に関しては不十分なところが多いので、ちょくちょくメンテナンスを入れようかと思っています。