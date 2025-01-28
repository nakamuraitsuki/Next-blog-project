---
title: 'Markdownパーサーのカスタムプラグインをつくってみた話'
date: '2025-01-01'
description: '目次取得処理や独自の記法を実現するためにunifiedのプラグインを追加したり実装したりしました。'
---

## 概要
---
そもそも、MarkdownからHTMLに変換する方法としてUnifiedを選んだのはその柔軟性が理由でした。

今回はUnified(remark/rehype)の柔軟性を体験すべく、色々な機能を実装してみます。

## 目次抽出
---
以前の僕の記事では、Markdownファイルの目次抽出とHTMLへの変換を別々に行っていました。

目次抽出をプラグイン化してしまうことで、処理を一括化してしまいましょう。

## まずは整理整頓
---
現在、Markdownを管理する関数は``/src/lib/markdown.ts``に全部まとめて書いていました。しかし、これからプラグインをいじいじするので、関数の増加が見込まれます。

とっ散らかってから慌てふためいても遅いので、先にファイル分割の戦術をchatGPTに聞いてしまいます。

例としてこんな構造が吐かれました。わあ、とてもよさそう。これにならって構成していきましょう。
```bash
src/
├── lib/
│   ├── markdown/
│   │   ├── index.ts         // markdownに関連するエクスポート集約
│   │   ├── parser.ts        // Markdownパーサー関連
│   │   ├── renderer.ts      // レンダリング関連
│   │   └── plugins/
│   │       ├── pluginA.ts   // プラグインA
│   │       └── pluginB.ts   // プラグインB
│   ├── posts/
│   │   ├── index.ts         // posts関連のエクスポート集約
│   │   ├── fetcher.ts       // データ取得関数
│   │   └── formatter.ts     // フォーマッタ
│   ├── utils/
│   │   ├── index.ts         // ユーティリティ関数集約
│   │   ├── string.ts        // 文字列操作
│   │   └── date.ts          // 日付操作
│   └── index.ts             // 全体のエクスポート集約
```

## 目次抽出プラグイン
---
以下の二つの記事を参考にしています。少し昔の記事ですが、色々見てみたところ問題なさそうなのでつかわせていただきます。

参考：

[unified を使って Markdown を拡張する](https://zenn.dev/januswel/articles/745787422d425b01e0c1)

[unified におけるプラグインまとめ](https://zenn.dev/januswel/articles/44801708e8c7fdd358e6?utm_source=chatgpt.com)

記事によると、Unifiedのプラグインには **Parser** ・ **compiler** ・ **transformer** の3種があるとのこと。

これは、Unifiedの定義している型の一つである **Plugin** 型の定義をGitHubのREADMEで確認すると分かりますね。

**Pluginの定義**
```TypeScript
type Plugin<
  PluginParameters extends unknown[] = [],
  Input extends Node | string | undefined = Node,
  Output = Input
> = (
  this: Processor,
  ...parameters: PluginParameters
) => Input extends string // Parser.
  ? Output extends Node | undefined
    ? undefined | void
    : never
  : Output extends CompileResults // Compiler.
  ? Input extends Node | undefined
    ? undefined | void
    : never
  : // Inspect/transform.
      | Transformer<
          Input extends Node ? Input : Node,
          Output extends Node ? Output : Node
        >
      | undefined
      | void
```
入力値が文字列ならParserに、コンパイル結果の場合Compilerに、Nodeの場合transformerになりそう。

とりあえず、構造木を編集したりするプラグイン（トランスフォーマー）は以下の形式で作れそうです。
```TypeScript
import { Plugin } from "unified";
import { Node } from "unist";
import { VFile } from "vfile";

const nop: Plugin<[], Node, void> = () => {
  return (tree: Node, file: VFile) => {
    // nop
  };
};

export default nop;
```

ほならば、目次抽出処理をプラグインにしていきましょうか。

もともとの目次抽出処理は以下の通り。
```TypeScript
//目次抽出用mdastを作成
const tree = fromMarkdown(content);

visit(tree, 'heading', (node: Heading) => {
    // レベルとテキスト内容を抽出
    const level = node.depth-1; // 見出しレベル
    const text = node.children
    .filter(child => child.type === 'text') // 'text' 型のノードのみフィルター
    .map(child => child.value) // 'text' 型ノードの 'value' プロパティを取得
    .join('');
    const id = slug(text,false);//rehype-slugの書式に統一

    tableOfContents.push({ level, text, id});
});
```
``tree``は、プラグインの処理の中で自然に渡されるので、``visit``で行っている処理を移植してくればよさそう。

``/src/lib/markdown/plugins/tocPlugin.ts``に書いていきます。
```TypeScript
import { Plugin } from "unified";
import { Node } from "unist";
import { Heading } from "mdast";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
import { slug } from "github-slugger";

// 目次の型
interface TableOfContentsItem {
    level: number;
    text: string;
    id: string;
};

interface TocPluginProps {
    toc: TableOfContentsItem[];
}

const tocPlugin: Plugin<[TocPluginProps],Node,void> = ({ toc }) => {
    return (tree: Node, file: VFile) => {
        visit(tree, 'heading', (node: Heading) => {
            //レヴェルとテキスト、IDを抽出
            const level = node.depth - 1;//h1タグは使わないので-1しておく
            const text = node.children
            .filter(child => child.type === 'text')
            .map(child => child.value)
            .join('')
            const id = slug(text,false);

            toc.push({ level, text, id});
        })
    }
}

export default tocPlugin;
```
こんな感じでしょうか。

あとはimportしてきて、プラグインとして使うだけ。配列を引数にすると自動的に参照渡しになるので、これで配列が取得できます。

```TypeScript
export async function markdownToHTML(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　HTML
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(print)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)//id付与
    .use(rehypeStringify)
    .process(content);

    return {
        toc: tableOfContents,
        html: result.toString()
    };
}
```
試しに``console.log(tableOfContents);``をどこかに埋め込んで、目次がちゃんと手に入っているか確認してみましょう。
```bash
[
  { level: 1, text: '概要', id: '概要' },
  {
    level: 1,
    text: 'そもそもどうやってMarkdown→HTMLを実現しているか',
    id: 'そもそもどうやってmarkdownhtmlを実現しているか'
  },
  { level: 1, text: '見出しにidを付与する', id: '見出しにidを付与する' },
  { level: 1, text: '見出しの配列を取得する', id: '見出しの配列を取得する' },
  { level: 1, text: '目次とid、一致しない問題', id: '目次とid一致しない問題' },
  { level: 1, text: '目次コンポーネント作成', id: '目次コンポーネント作成' },
  {
    level: 1,
    text: '突如立ちはだかるposition:stickyの壁',
    id: '突如立ちはだかるpositionstickyの壁'
  },
  { level: 1, text: 'おわりに', id: 'おわりに' }
]
```
ちゃんと動いてそうですね。よしよし。

## ESLintを黙らせろ
---
今のままだと``npm run build``が失敗します。ESLintが何か言ってきますね。

transformerプラグイン内の``file: VFile``を使用していないからです。私は普段こういう「使わないけど必要になる場合もあるやつ」は
``_file: VFile``みたいな感じで使用しないことを明示して書いています。省略するのも手ですが。

ということで、``_``から始まる変数に対する『呼び出してないよ』のエラーを無視させましょう。

[公式ドキュメント](https://typescript-eslint.io/rules/no-unused-vars)を参考にします。

Nextプロジェクト作成時に``eslint.config.mjs``というファイルができているので、それに公式ドキュメントの内容を追記してきます。

```JavaScript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
    },
  },
];

export default eslintConfig;

```
これでESLintを黙らせられます。

## 呟きボックス
---
本当にただの個人の意見を述べるときには、それが分かるような見た目になっているといいですよね。

プラグインをいじいじすることで、そういった記法を読み取らせて、表示させようと思います。

始めに参考記事を書いておきます。

参考：[unified を使って Markdown を拡張する](https://zenn.dev/januswel/articles/745787422d425b01e0c1)

:::tweet
型の処理にかなり苦労しました。このブログの中で一番実装に時間をかけたかも。
:::

## 木の状態を観察する
---
記事を調べていると、プラグインを作る際にはASTの状態を逐一確認するのが大切だという記述とともに、観察用プラグインが紹介されていました。
```TypeScript
import unified from "unified";
import { Node } from "unist";
import { VFileCompatible } from "vfile";
import { inspect } from "unist-util-inspect";

const print: unified.Plugin = () => {
  return (tree: Node, file: VFile) => {
    console.log(inspect(tree));
  };
};

export default print;
```
参考：[unified を使って Markdown を拡張する](https://zenn.dev/januswel/articles/745787422d425b01e0c1)

``import unified from "unified"``となっていますが、これはTypeScriptとして関数の返り値が``Plugin``型であるのを明確化するためなので、私は``import Plugin from 'unified'``としてしまいました。

以下は私の実装です。
```TypeScript
import { Plugin } from "unified";
import { Node } from "unist";
import { VFile } from "vfile";
import { inspect } from "unist-util-inspect";

export const print: Plugin = () => {
  return (tree: Node, _file: VFile) => {
    console.log(inspect(tree));
  };
};

export default print;
```

## 1. tweet記法を決める
---
今更ながら、呟きボックスの具体的な記法を決めます。

Zennのメッセージ記法をパクって、
```markdown
:::tweet
おなかすいたなぁ
:::
```
こんな感じに書いた時に、吹き出しに表示されるようにするのを目標にします。

さっそくテストファイルを作成します。``/posts``の中にtest.mdを作成。

こういうテストファイル作ると、大体消し忘れてそのまま公開しちゃうんですよね。気をつけます。
```markdown
## 見出し
:::tweet
おなかすいたなぁ
:::
```

先ほど作った観察用プラグインを使ってみましょう。
```bash
root[2] (1:1-4:4, 0-28)
├─0 heading[1] (1:1-1:7, 0-6)
│   │ depth: 2
│   └─0 text "見出し" (1:4-1:7, 3-6)
└─1 paragraph[1] (2:1-4:4, 7-28)
    └─0 text ":::tweet\nおなかすいたなぁ\n:::" (2:1-4:4, 7-28)
```
ほえー。ASTってこうなってるんだぁ。

## 2. tweet記法を見つける関数作成
---
プラグインでtweet記法を解釈するには、そもそも **tweet記法かどうか判定する** 必要があります。

そこで、tweet記法を判定する``isTweet``関数を定義していきたいと思います。

参考記事を元に書いていきます。

まずは、Nodeである、Textである、などのmdastに既存のタイプを判定をできるようにします。これはTypeScriptの型を安全に扱うためです。

``/src/lib/markdown/utils/nodeUtils.ts``に書き込んでいきます。
コード自体は[記事で取り上げられていたこのコード](https://github.com/januswel/unified-sample/blob/main/src/plugins/transformers/util.ts)
のコピペです。

### ユーザー定義型ガード
---
先ほどのコードの中で、以下のようなものがあったかと思います。
```TypeScript
export function isNode(node: unknown): node is Node {
  return isObject(node) && "type" in node;
}
```
これの、``node is Node``とは何でしょうか。

これは、 **ユーザー定義型ガード** と呼ばれるものです。

[TypeScript Deep Dive 日本語版](https://typescript-jp.gitbook.io/deep-dive/type-system/typeguard#yznotype-guard)
に詳しく書いてありますが、通常の``instanceof``や``typeof``では、ユーザーが自身で定義した型を判定することはできません。

そこで、 **ユーザーが定義した型をどうやって識別するか決める** のがユーザー定義型ガードであり、その書き方が先ほどのものだという事です。

先ほどの関数の中身がtrueとなれば、そのnodeは関数内で **Node型であるという判定にする** 、という事。

これで、エラーを起こさず安全に自分で作った型を扱えます。

---
さて、気を取り直してtweet記法を見つける``isTweet``関数を定義しましょう。
``/src/lib/markdown/utils/tweetUtils.ts``の中に書き込んでいきます。
```TypeScript
import { isParagraph, isText } from "./nodeUtils";
import { Paragraph } from "mdast";

const TWEET_BEGGINING = ":::tweet\n";
const TWEET_ENDING = "\n:::";

export function isTweet(node: unknown): node is Paragraph {
    //paragraphじゃなかったらTweetでもない
    if (!isParagraph(node)) {
        return false;
    }

    //分割代入によってchildrenプロパティを抽出
    const { children } = node;

    //":::tweet\nで始まっていなかったらTweet記法じゃない"
    const firstChild = children[0];
    if (!(isText(firstChild) && firstChild.value.startsWith(TWEET_BEGGINING))) {
        return false;
    }

    //":::で終わってなかったらTweet記法じゃない"
    const lastChild = children[children.length -1];
    if (!(isText(lastChild) && lastChild.value.endsWith(TWEET_ENDING))) {
        return false;
    }

    return true;
}
```
最初に書いた
```TypeScript
const TWEET_BEGGINING = ":::tweet\n";
const TWEET_ENDING = "\n:::";
```
は、記法の先頭部分と末尾部分の定義です。これと照らし合わせて判定をします。

次にある
```typescript
//paragraphじゃなかったらTweetでもない
if (!isParagraph(node)) {
    return false;
}
```
この部分は型ガードです。``node is Paragraph``と唱えているので、nodeがParagraphじゃないときはfalseを返しておきます。

最後の部分について
```typescript
//":::tweet\nで始まっていなかったらTweet記法じゃない"
const firstChild = children[0];
if (!(isText(firstChild) && firstChild.value.startsWith(TWEET_BEGGINING))) {
    return false;
}

//":::で終わってなかったらTweet記法じゃない"
const lastChild = children[children.length -1];
if (!(isText(lastChild) && lastChild.value.endsWith(TWEET_ENDING))) {
    return false;
}
```
これは具体的なASTを見ると分かりやすいかと思います。
```bash
└─1 paragraph[1] (2:1-4:4, 7-28)
    └─0 text ":::tweet\nおなかすいたなぁ\n:::" (2:1-4:4, 7-28)
```
この場合children.lengthは1ですから、firstChild=lastChild=children[0]ですね。

これはTextであり、先頭が``:::tweet\n``で、末尾が``\n:::``ですから、上の二つの処理は走らず、trueが返されるという事になります。

これで、あるパラグラフがtweet記法かどうかがわかるようになりました。

## 3. Visitを使って巡回・tweet記法をtweetタイプのノードに変換
---
さて、目次抽出の時にも使った``visit``を使って、tweet記法をtweetノード（自作）に変換するプラグインを作りましょう。

まずはtweetノードの型を決めます。
```TypeScript
interface TweetNode extends Node {
    type: "tweet";
    children: PhrasingContent[];
}
```
型は他のNode型等を見ながら決めていきます。tweet記法の内側にはただの文面以外にも色々と入れる可能性があるので子要素としてPhrasingContentを持てるようにしています。

次に、変換の仮定をまとめてみます。

1. **:::tweet\nを取り除く**

2. **:::\nを取り除く**

3. **その他中身を保持したままTweetNodeに変換する**

です。

とりあえず構文木を巡回するプラグインを書いてから、上記3ステップをこなしていきます。

``/src/lib/markdown/plugins/tweetPlugin.ts``にプラグインを作ります。
```TypeScript
const TWEET_BEGGINING = ":::tweet\n";//記法の始まり
const TWEET_ENDING = "\n:::";//記法の終わり

interface TweetNode extends Node {
    type: "tweet";
    children: PhrasingContent[];
}

export const tweetPlugin: Plugin<[], Node, void> = () => {
    return (tree: Node, _file: VFile) => {
        //treeのTweet記法を訪れた時に、変換処理をする。
        visit(tree, isTweet, (node: Paragraph, index: number | undefined, parent: Parent | undefined ) => {
            if (!isParent(parent) || typeof index !== "number") {
                return;
            }

            const children = [...node.children];
            //ここに先述した3ステップを書く
        })
    }
}
```
こんな感じ。visitの書き方は目次取得のプラグインと同じですね。

``visit(探索対象の木, フィルタリング対象, 処理関数)``の書き方です。

isTweetでフィルタリングしている時点で **Paragraphノードであること** ・ **childrenの最初と最後がTextNodeであること** ・ **Tweet記法が使われていること** 
が保証されます。``children``は必ず``PhrasingContent``になります。

### :::tweet\nを取り除く
---
記法の頭の部分を取り除きます。

``/src/lib/markdown/utils/process.ts``に先頭に対する処理関数``processFirstChild``を作っていきます。

まずはASTを見てみましょうか。

```Markdown
## 見出し
:::tweet
おなかすいたなぁ
:::

:::tweet
**こんにちは**
と言いたい
:::
```
こういうテストファイルを作ると
```bash
root[3] (1:1-9:4, 0-58)
├─0 heading[1] (1:1-1:7, 0-6)
│   │ depth: 2
│   └─0 text "見出し" (1:4-1:7, 3-6)
├─1 paragraph[1] (2:1-4:4, 7-28)
│   └─0 text ":::tweet\nおなかすいたなぁ\n:::" (2:1-4:4, 7-28)
└─2 paragraph[3] (6:1-9:4, 30-58)
    ├─0 text ":::tweet\n" (6:1-7:1, 30-39)
    ├─1 strong[1] (7:1-7:10, 39-48)
    │   └─0 text "こんにちは" (7:3-7:8, 41-46)
    └─2 text "\nと言いたい\n:::" (7:10-9:4, 48-58)
```
こういうログが出ます。

これを元に関数を書いていきます。
```TypeScript
import { PhrasingContent } from "mdast"
import { isText } from "./nodeUtils";

export function processFirstChild (children: Array<PhrasingContent>, identifier: string) {
    if(isText(children[0])){
        const firstChild = children[0];
        const firstValue = firstChild.value;
        if(firstValue === identifier) {//記法の頭に一致していたら
            children.shift();//丸ごと取り除く
        } else {//記法＋文字だったら
            //記法の部分だけ取り除く
            children[0] = {
                ...firstChild,
                value: firstValue.slice(identifier.length),
            };
        }
    }
}
```
``isTweet``で絞り込みを行っているので、その制約を元に引数の型などを決めています。

``if(isText(children[0]))``は、我々からしたら分かりきっているのですが、
それを明確に示してTypeScriptの型安全を保証しています。

### :::\nを取り除く
---
やることは、先ほどと変わりません。

``/src/lib/markdown/util/process.ts``に追記していきます。
```TypeScript
export function processLastChild (children: Array<PhrasingContent>, identifier: string) {
    const lastIndex = children.length - 1;
    if(isText(children[lastIndex])){
        const lastChild = children[lastIndex];
        const lastValue = lastChild.value as string;
        if (lastValue === identifier) {//記法の末尾に一致していたら
          children.pop();//丸ごと取り除く
        } else {//記法の末尾に一致していなかったら
            //記法の部分だけ取り除く
            children[lastIndex] = {
            ...lastChild,
            value: lastValue.slice(0, lastValue.length - identifier.length),
            };
        }
    }
}
```

### その他中身を保持したままTweetNodeに変換する
---
後は、作った機能をプラグインに組み込みます。先ほど書いたプラグインに処理関数を持ってきます。
```TypeScript
export const tweetPlugin: Plugin<[], Node, void> = () => {
    return (tree: Node, _file: VFile) => {
        //treeのTweet記法を訪れた時に、変換処理をする。
        visit(tree, isTweet, (node: Paragraph, index: number | undefined, parent: Parent | undefined ) => {
            if (!isParent(parent) || typeof index !== "number") {
                return;
            }

            const children = [...node.children];
            processFirstChild(children, TWEET_BEGGINING);
            processLastChild(children, TWEET_ENDING);

            parent.children[index] = {
                type: "tweet",
                children,
            } as TweetNode;
        })
    }
}
```
この中で、
```typescript
parent.children[index] = {
    type: "tweet",
    children,
} as TweetNode;
```
が変換処理です。

今見ていたノードを、親要素視点で見て変更を加えます。

**これで完成！**

試しに使ってみます。
```TypeScript
//markdown →　HTML
const result = await unified()
.use(remarkParse)
.use(tocPlugin, {toc: tableOfContents})//目次抽出
.use(tweetPlugin)
.use(print)
.use(remarkGfm)
.use(remarkRehype)
.use(rehypeHighlight)
.use(rehypeSlug)//id付与
.use(rehypeStringify)
.process(content);
```
こうすると？
```bash
root[3] (1:1-9:4, 0-58)
├─0 heading[1] (1:1-1:7, 0-6)
│   │ depth: 2
│   └─0 text "見出し" (1:4-1:7, 3-6)
├─1 tweet[1]
│   └─0 text "おなかすいたなぁ" (2:1-4:4, 7-28)
└─2 tweet[2]
    ├─0 strong[1] (7:1-7:10, 39-48)
    │   └─0 text "こんにちは" (7:3-7:8, 41-46)
    └─1 text "\nと言いたい" (7:10-9:4, 48-58)
```
おお、ちゃんと変換されていますね。

## 4. mdast→hastの変換を拡張(tweetノードの変換を定義)
---
ノード変換までは成功しました。次にやるのはこのノードに対する解釈を与えてやることです。

定義として、tweetノードはclassName="tweet"のdivにすることにしましょう。

やることを先に整理しておきます。

- **型の処理**

- **解釈ハンドラの定義**

- **ハンドラの適用**

さっそく順々に実装します。

### 型の処理
---
↓記事のやり方
```TypeScript
import { H } from "mdast-util-to-hast";

export default function handler(h: H, node: Node) {
  // ここを実装する
}

const processor = unified()
  .use(parser)
  .use(plugin)
  .use(toHast, {
    handlers: {
      message: handler,
    },
  })
  .use(compiler);
```
この記述を現時点での私のコードに落とし込むとこうなります。
```TypeScript
//markdown →　HTML
const result = await unified()
.use(remarkParse)
.use(tocPlugin, {toc: tableOfContents})//目次抽出
.use(tweetPlugin)
.use(remarkGfm)
.use(remarkRehype, { handlers: {
    tweet: tweetHandler,
  },
})
.use(rehypeHighlight)
.use(rehypeSlug)//id付与
.use(rehypeStringify)
.process(content);
```
ですが、これだと **handlersのところに型エラーが出る** はずです。

何がいけないのかを探っていきます。

おそらく、『``tweet``が規定の型の中に無い』と言うような内容のエラーが出るのではないかと思います。

この書き方に関わっている``remark-rehype``、``handlers``などの型を確認しに行きましょう。

[remrk-rehype](https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#unifieduseremarkrehype-destination-options)
を見ると、remark-rehypeの使い方は
```typescript
unified().use(remarkRehype[, destination][, options])
```
であると分かります。

handlersってのはどこに相当するのかというと、[同じドキュメント内のoptions](https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#options)
ですね。

optionsに渡すhandlersは、mdast-util-to-hastのドキュメント内に書いてある``Handlers``型のようです。

[mdast-util-to-hastの該当部分](https://github.com/syntax-tree/mdast-util-to-hast#handlers)を見ると、
```TypeScript
type Handlers = Partial<Record<Nodes['type'], Handler>>
```
となっているらしい。

規定のタイプの中にtweetがない、というのはNodesのタイプにtweetがないという事ですね。

独自に作ったので、当たり前と言えば当たり前です。

ではどうするか。Nodesを拡張してTweetNodeを受け入れてもらえるように魔改造していきます。

拡張の仕方については、[mdast-util-frontmatter](https://github.com/syntax-tree/mdast-util-frontmatter/tree/main?tab=readme-ov-file#types)
の中にいい先例があったのでこれなどを元に作っていきます。

VSCodeは優秀なので、シンプルな型なら中身をカーソルを当てるだけで教えてくれたりもします。どうやら
```TypeScript
Nodes = Root | RootContent
```
らしい。

よし、拡張しましょう。この先にも拡張をするかもしれないので、``/src/lib/type/nodes.ts``の中で拡張を行います。

こうしておけば、また新しい型をNodesに含めたいときにもこのファイルをいじるだけで済みますね。

```TypeScript
import { TweetNode } from "./tweet";

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
    }
}
```
TweetNodeは先ほど自分で作ったやつです。↓
```TypeScript
import { PhrasingContent } from "mdast";

//Tweet用のNode
export interface TweetNode extends Node {
    type: 'tweet';
    children: PhrasingContent[];
}
```

どうしてこのように書くと型を拡張できるのでしょうか。

それは、TypeScriptの **宣言マージ** によるものです。

[オープンエンドと宣言マージ (open-ended and declaration merging) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/object-oriented/interface/open-ended-and-declaration-merging)
が分かりやすいので、是非見てみてください。

要は、**同じinterfaceが2回宣言されたら、その二つを合体してくれる** というものです。

これを使って、既にmdastで提供されているRootContentMapを再度宣言し、tweetノードを後ろにくっつけてもらっているという事ですね。

``declare module 'mdast'{ ... }``は何だ、と思われるかもしれません。これはモジュールを拡張機能を使うためのものです。

[TypeScriptのdeclareやinterface Windowを勘で書くのをやめる2022](https://zenn.dev/qnighy/articles/9c4ce0f1b68350#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E6%8B%A1%E5%BC%B5)

少し昔のものですが、この記事が参考になるかなと思いました。

これで、Nodesのタイプの中に'tweet'を組み込めました。

### 解釈のハンドラ定義
---
次にやるのはtweetHandlerを作ることです。TweetNodeを見つけたときにそれをどうやって処理するか定義していきます。

参考記事のやり方は以下のようになっています。
```TypeScript
import { H } from "mdast-util-to-hast";
import all from "./all";

export default function handler(h: H, node: Node) {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["msg"],
    },
    children: all(h, node),
  };
}
```
ですが、``import { H } from "mdast-util-to-hast";``を書くとエラーが出るはずです。

githubを見に行くと、提供している型の中にHはありません。

リリースノートを見ると、[v12.3.0のリリースノート](https://github.com/syntax-tree/mdast-util-to-hast/releases/tag/12.3.0)
に記述がありました。

v12.3.0で、HはStateに改名され、allやoneといった関数がstateに吸収されていそう。

それを踏まえて、定義関数を``/src/lib/markdown/utils/tweetUtils.ts``に書いていきます。
```TypeScript
import { Handler, State } from "mdast-util-to-hast";
import { TweetNode } from "@/lib/type";

export const tweetHandler: Handler = (h: State, node: TweetNode) => {
    return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["tweet"],
        },
        children: h.all(node),
      };
}
```
all関数は、引数のノードの子要素をすべて配列にする関数です。

つまり、tweetNode部分をclassName付きのdivにして、残りの子要素はそのまま受け渡しています。

### ハンドラの適用
---
さて、ハンドラを適用していきます。

```TypeScript
//remarkRehypeに渡すカスタムハンドラ
const handlers: Partial<Record<Nodes['type'], Handler>> = {
    tweet: tweetHandler//tweetNodeに対する処理を定義
};

export async function markdownToHTML(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　HTML
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(tweetPlugin)
    .use(remarkGfm)
    .use(remarkRehype, { handlers })//ハンドラを渡す
    .use(rehypeHighlight)
    .use(rehypeSlug)//id付与
    .use(rehypeStringify)
    .process(content);

    return {
        toc: tableOfContents,
        html: result.toString()
    };
}
```
handlersには、これからも記法を追加し、そのたびに新しいノードとハンドラが増えるので、分かりやすいように別の場所に書いておきました

これで、markdown→hastの段階で、tweetNodeをうまく処理できます。
printプラグインを使ってASTを観察してみると…
```bash
root[5] (1:1-9:4, 0-58)
├─0 element<h2>[1] (1:1-1:7, 0-6)
│   │ properties: {}
│   └─0 text "見出し" (1:4-1:7, 3-6)
├─1 text "\n"
├─2 element<div>[1]
│   │ properties: {"className":["tweet"]}
│   └─0 text "おなかすいたなぁ" (2:1-4:4, 7-28)
├─3 text "\n"
└─4 element<div>[2]
    │ properties: {"className":["tweet"]}
    ├─0 element<strong>[1] (7:1-7:10, 39-48)
    │   │ properties: {}
    │   └─0 text "こんにちは" (7:3-7:8, 41-46)
    └─1 text "\nと言いたい" (7:10-9:4, 48-58)
```
確かにclassNameがtweetのdivが生成されていますね。

## 5. classNameを元にJSXコンポーネントに変換
---
className="tweet"のdivをJSXの<Tweet>コンポーネントに変換していきます。

使うのは[rehype-react](https://github.com/rehypejs/rehype-react)です。

やることは先ほどとほとんど一緒です。classNameを付与しているだけなので、型の拡張などは必要ありません。

公式ドキュメントを見ながら型を合わせていきます。

まずはインストール
```bash
npm install rehype-react;
npm install hast-util-to-jsx-runtime;
```

### プラグインをJSX仕様に変更
---
次に``/src/lib/markdown/markdown.ts``に追記していきます。
```TypeScript
//remarkReactに渡すカスタムハンドラ
const rehypeReactHandlers: Partial<Components> = {
    div: divHandler,//divHandlerは後で定義する
}
```
を作って、今までMarkdown→HTMLとしていたところをMarkdown→JSXとしていきます。
```TypeScript
//型を変更
interface MarkdownContent {
    toc: TableOfContentsItem[];
    JSXElement: JSX.Element;
}

//remarkReactに渡すカスタムハンドラ
const rehypeReactHandlers: Partial<Components> = {
    div: divHandler,
}

//markdownToHTMLを改名
export async function markdownToJSX(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　JSX
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(tweetPlugin)
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
変わった部分を見ていきます。

まず、最終的にhtmlではなくJSXを返すようにしたいので、返り値の型であるMarkdownContentを更新しました。

変更前↓
```typescript
interface MarkdownContent {
    toc: TableOfContentsItem[];
    html: string;
}
```
変更後↓
```typescript
interface MarkdownContent {
    toc: TableOfContentsItem[];
    JSXElement: JSX.Element;
}
```
また、変換処理のプラグインの中に``rehypeReact``が追加されています
remarkReactに渡すオプションがcomponents以外にもいろいろ書いてありますが、[公式ドキュメント](https://github.com/rehypejs/rehype-react?tab=readme-ov-file#components)
に説明があります。

jsx,jsxsをどちらも付けておくことで、動的・静的なJSXのどちらも作れるようになっていると私は解釈しています。

正直私のやっている範囲ならjsxsだけでも動く気がしますが、念のためどちらも付けています。

### 変換する関数作成
---
``divHandler``がまだ未定義なので、それを作っていきます。

``/src/lib/markdown/utils/divHandler.tsx``に作っていきます。

:::tweet
私は拡張子を **ts** にしていたために型警告を受け続けていました。~~時間がもったいない！！(効率厨コビー)~~必ず拡張子を **tsx** にしましょう。
:::

```ts
import { Components } from "rehype-react";
import { JSX } from "react";
import { ExtraProps } from "hast-util-to-jsx-runtime";
import { Tweet } from "@/components/Tweet/Tweet";
//返り値がJSX.Elementであることまでちゃんと書いてあげる
export const divHandler: Components['div'] = (props: JSX.IntrinsicElements['div'] & ExtraProps): JSX.Element => {
    //分割代入で展開
    const { node, className, ...restProps } = props;

    if (className === 'tweet') {
        return <Tweet>{props.children}</Tweet>;
    }

    return <div {...restProps} />;
};
```
関数の型や引数の型は[hast-util-to-jsx-runtimeの公式ドキュメント](https://github.com/syntax-tree/hast-util-to-jsx-runtime?tab=readme-ov-file#components)
を元にしています。

Tweet記法においては、TweetNodeの定義的にchildren以外の値はそもそも空なはずなので、children以外の値は捨ててprops.childrenのみを渡しています。

その他のノードの場合は何が起こるかわからないので、一応すべての要素を引き継いでもらっています。

### slugページをJSX仕様にする
---
今までは、Markdown→HTMLとして表示していましたが、先ほどの変更によりMarkdown→JSXとなったので、表示するページ側も
変更をしなくてはなりません。

と言っても変更はそこまで難しくありません。
今までは
```jsx
<div className={styles.markdown} dangerouslySetInnerHTML={{ __html: markdownContent.html }}/>
```
としていたところを
```jsx
<div className={styles.markdown}>
{markdownContent.JSXElement}
</div>
```
とするだけです。

classNameはマークダウンの文面にCSSを当てるためのものですので、あまり気にしなくていいです。

これで対応終了

## 6. Tweetコンポーネントを作成する
---
先ほどのdivHanlerの中でしれっと呼び出していたTweetコンポーネントを作ります。

吹き出しっぽい見た目を実装していきます。

ネットで『CSS 吹き出し』と調べて、よさそうなものをそのままいただいてきました。

```ts
import styles from "./Tweet.module.css";

export const Tweet = ({ children }) => {
    return(
        <div className={styles.wrap}>
            <div className={styles.tweet}>
                {children}
            </div>
        </div>
    )
}
```
```css
.wrap {
    width: 100%;
    margin: 32px auto;
}
/*本体*/
.tweet{
    max-width: 750px;
    width: fit-content;
    margin-left: 40px;
    margin-right: 40px;
    font-size: 0.875rem;
    position: relative;
    padding: 20px;
    border: 1px solid #6f5d00;
    color: #6f5d00;
    border-radius: 8px;
}
/* 大きい丸 */
.tweet::before{
    content: '';
    position: absolute;
    display: block;
    border-radius: 50%;
    border: 1px solid #6f5d00;
    left: -20px;
    bottom: 15px;
    width: 15px;
    height: 15px;
}
  /* 小さい丸 */
.tweet::after{
    content: '';
    position: absolute;
    display: block;
    border-radius: 50%;
    border: 1px solid #6f5d00;
    left: -35px;
    bottom: 10px;
    width: 10px;
    height: 10px;
}
```
これで、実装はすべて完了です。

## まとめ
---
成果を確かめてみます。
```md
:::tweet
これはあくまで **個人の意見** です
:::
```
と書くと…

:::tweet
これはあくまで **個人の意見** です
:::

と表示されるようになりました。

この記法の導入方法は、かなり拡張性があって色々やれるのではないかと思いました。

今後も何かしら独自の記法を導入していきたいと思います。