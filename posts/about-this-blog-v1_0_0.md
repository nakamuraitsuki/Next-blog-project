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
**Turbopack**というのは、**Webpack**に代わるバンドラーらしいです。

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
```bash
npm run dev
```
で起動できますよ！

## 3.Markdownファイルのリスト取得
---
最低限ブログとして動くためには、Markdownファイルをどこかしらのディレクトリに入れておいて、それを読み込むという事が必要になります。

ひとまずは、「記事一覧ページ」のための記事の情報配列を得る関数の完成を目指してみます。

まだファイルの場所の整理などはしていませんが、とりあえず記事の取得に関する関数は``/src/lib/posts.ts``に書くこととします。

### 記事の全件取得をする関数
---
まず、現時点でこのサイトで動いているものを載せておきます。
```TypeScript
import fs from 'fs/promises'; //fsモジュール（非同期版）
import path from 'path'; //pathをつかさどる
import matter from 'gray-matter';

//メタデータの型
interface FrontMatter {
  title: string;
  date: string;
  description: string;
}

//記事の型
interface Post {
  frontMatter: FrontMatter;
  slug: string;
  content: string;
}

//起動時にルートディレクトリを得て、ルート直下のpostsディレクトリパスにする
const postDirectory = path.join(process.cwd(), 'posts');

// 全記事のデータを取得
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    // ディレクトリ内のファイルを非同期で読み取る
    const files = await fs.readdir(postDirectory);

    // 各ファイルの内容を処理
    const posts: Post[] = await Promise.all(
      files.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');//.mdを消して名前だけにする(slug)
        const filePath = path.join(postDirectory, fileName);//読み取るファイルの位置を特定
        const fileContent = await fs.readFile(filePath, 'utf-8'); // 非同期読み込み
        const { data, content } = matter(fileContent);//メタデータと本文を抽出

        //returnの内容がpostsに入れられていく
        return {
          frontMatter: data as FrontMatter,
          slug,
          content,
        };
      })
    );

    //日付順にソート
    const sortedPosts = posts.sort((postA, postB) =>
      new Date(postA.frontMatter.date) > new Date(postB.frontMatter.date) ? -1 : 1
    );
    
    return sortedPosts;//ソートした記事の配列を返す。
  } catch (error) {
    console.error('Error reading posts:', error);
    return []; // エラー時は空の配列を返す
  }
};
```
この関数を作った中で学んだことを書き連ねてみます。
- **fsモジュール**
- **gray-matter**

あれ、思ったより少ないな…
### fsモジュール
---
ファイルの読み取りには**fs**というモジュール（関連する機能をひとまとめにしたやつ）を使います。

fsは**F**ile **s**ystemの略で、Node.jsの標準モジュールです。

**[公式ドキュメント](https://nodejs.org/api/fs.html#fsreadfilepath-options-callback)** やネットに転がっている記事が大変参考になりました。

まずはインポートから。
```TypeScript
import fs from 'fs/promises';
```

``getAllPosts``関数の中でfsモジュールが使われているのは
```TypeScript
// ディレクトリ内のファイルを非同期で読み取る
const files = await fs.readdir(postDirectory);
…
（中略）
…
const fileContent = await fs.readFile(filePath, 'utf-8'); // 非同期読み込み
```
の部分ですね。

公式ドキュメント等ではコールバック関数でエラーハンドリングを行っていますが、いちいち書くのは面倒なので、
```TypeScript
try{
    //記事取得
} catch(error){
    //エラーハンドリング
}
```
の形でまとめています。

以下にはこのプロジェクト内で使っている者のみ紹介しますが、ファイルに対する一通りの操作は実現できるようなので、是非[公式ドキュメント](https://nodejs.org/api/fs.html#callback-api)を覗いてみて下さい。

#### readdir関数
ディレクトリの中身を覗く関数です。``fs.readdir(path[, options], callback)``の形で使用します。

今回の実装では、
```TypeScript
const postDirectory = path.join(process.cwd(), 'posts');
```
で取得した、記事のMarkdownファイルを入れるディレクトリの絶対パスを渡しています。

``process.cwd()``では、そのスクリプトが実行された時のディレクトリを返します。これは、プロジェクトのルートになります。

よって、パスを文字列のように操作できるpathモジュールを利用して、``process.cwd()``の後ろに``/posts``をくっつけてやると、記事を入れてるディレクトリの絶対パスが得られるというわけです。

試しに、
```JavaScript
console.log(files);
```
というコードを関数のどこかに入れ込んでみましょう。
```bash
[ 'ISUCON14.md', 'about-this-blog-v1_0_0.md' ]
```
私の場合、このようなログが表示されました。

私の書いた記事のMarkdownファイルが配列として返ってきているのが確認できましたね。

#### readFile関数

ファイルの中身を読み取る関数です。``fs.readFile(path[, options], callback)``の形で使用します。
今回の実装では、先ほどの``readdir``を使って読み取ったファイルの名前たち一つ一つに対して、``fileName``という変数に入れてから、
```TypeScript
//読み取るファイルの位置を特定
const filePath = path.join(postDirectory, fileName);
```
として、中身を読みたいファイルへのパスを特定し、
```TypeScript
const fileContent = await fs.readFile(filePath, 'utf-8'); // 非同期読み込み
```
で読み取っています。

### gray-matter
---
**[gray-matter](https://github.com/jonschlinkert/gray-matter)** は、ファイルのフロントマター（メタデータ）を解析するためのパッケージです．

[公式のドキュメント](https://github.com/jonschlinkert/gray-matter)が非常にわかりやすいので，引用させていただきます．

簡単に言うと，
```html
---
title: Hello
slug: home
---
<h1>Hello world!</h1>
```
を解析して
```bash
{
  content: '<h1>Hello world!</h1>',
  data: {
    title: 'Hello',
    slug: 'home'
  }
}
```
を返すというものです．

ここにタイトルや日付を書いておくことで、記事の扱いが非常に楽になりますね。

``readFile``関数で読み取ったMarkdownファイルの内容(fileContent)を，gray-matterでメタデータと内容に分離しているのが以下のコードです．
```TypeScript
const { data, content } = matter(fileContent);//メタデータと本文を抽出
```

### Promise.allという書き方
---
記事を書いている内に、``Promie.all``というものをこのブログを作る中で初めて知ったことを思い出したので。メモしておきます。

[公式ドキュメント](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)や[この動画](https://www.youtube.com/watch?v=ZOegyhySvPY&t=45s)などが非常に参考になりました．

``Promise.all``によって、並列処理っぽいことが可能になるという事ですね。

Markdownファイルの取得の中では、「記事名の配列の要素一つ一つに対して、対応するファイルの中身を読み、メタデータとコンテンツに分離して``posts``配列に入れる」という作業で使っています．記事の数が膨大になってきたときに逐次処理だと少し時間がかかるところを、
高速で行えるというメリットがあります。

該当部分は以下のコードです。
```TypeScript
// 各ファイルの内容を処理
const posts: Post[] = await Promise.all(
  files.map(async (fileName) => {
    const slug = fileName.replace(/\.md$/, '');//.mdを消して名前だけにする(slug)
    const filePath = path.join(postDirectory, fileName);//読み取るファイルの位置を特定
    const fileContent = await fs.readFile(filePath, 'utf-8'); // 非同期読み込み
    const { data, content } = matter(fileContent);//メタデータと本文を抽出

    //returnの内容がpostsに入れられていく
    return {
      frontMatter: data as FrontMatter,
      slug,
      content,
    };
  })
);
```

果たして、私にPromise.allの真価を発揮させるほどの膨大な記事が書けるでしょうか。

### 余談：Timsortを知ったはなし
---
returnされる記事の配列は、日付順にソートされてて欲しいな…

そう思って関数内に直接ソートを組み込んでしまいました。
```TypeScript
//日付順にソート
const sortedPosts = posts.sort((postA, postB) =>
  new Date(postA.frontMatter.date) > new Date(postB.frontMatter.date) ? -1 : 1
);
```
そして、ふと思ったのです。これの時間計算量はどのくらいなんだろうと。

結論から言うと、平均で **O(n logn)** でした。マージソートに一部挿入ソートを組み込むことによって
、既に多少ソート済みな配列に対してとても良いパフォーマンスを出せるようです。

参考記事：[高速な安定ソートアルゴリズム "TimSort" の解説 - Preferred Networks Research & Development](https://tech.preferred.jp/ja/blog/tim-sort/)

## 4.リストの表示
---
記事のリストを取得する関数ができたので、これを使って **「記事一覧ページ」** を作ってみます。

App Routerによるルーティングが行われるので、``/src/app/blog``というディレクトリを作り、その中に``page.jsx``を作るとその中身を``/blog``というURLで見れるようになります。

とりあえず、記事の情報を引数に取るカードコンポーネントをつくって、並べてみようかと思います。

### カードコンポーネント
---
コンポーネントはTypeScriptで書きます。その方が面倒が少ないと思ったのでそうしました。

``/src/components``みたいなディレクトリを作ります。ここにコンポーネントをまとめておきます。

``/src/components/BlogCard``みたいなディレクトリを作って、その中にカードコンポーネントと、その見た目を決めるCSSファイルを置きます。

```TypeScript
import styles from "./BlogCard.module.css"
import Link from "next/link";

interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

interface Post {
    frontMatter: FrontMatter;
    slug: string;
    content: string;
  }

interface BlogCardProps {
    post: Post;
}

const BlogCard = ({ post } :BlogCardProps) => {
    return (
        <Link href={`/blog/${post.slug}`} passHref>
            <div className={styles.card}>
                <p className={styles.date}>{post.frontMatter.date}</p>
                <p className={styles.title}>{post.frontMatter.title}</p> 
                <p className={styles.description}>{post.frontMatter.description}</p>
            </div>
        </Link>
    );
}

export default BlogCard;
```
こんな感じ。

カードの見た目をほかのところでも使うかも…とおもって名前が``BlogCard``となっています。

簡単にコードの説明をしておくと、
```TypeScript
interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

interface Post {
    frontMatter: FrontMatter;
    slug: string;
    content: string;
  }

interface BlogCardProps {
    post: Post;
}
```
TypeScriptなので、厳密に型を決めなくてはなりません。

このへんで記事に関する情報を受け取るための型（箱）を用意しています。この辺は、ひとつ前のセクションで書いた関数の返り値を元に作っています。

そして、コンポーネント自体はそれを並べるだけ。
```TypeScript
const BlogCard = ({ post } :BlogCardProps) => {
    return (
        <Link href={`/blog/${post.slug}`} passHref>
            <div className={styles.card}>
                <p className={styles.date}>{post.frontMatter.date}</p>
                <p className={styles.title}>{post.frontMatter.title}</p> 
                <p className={styles.description}>{post.frontMatter.description}</p>
            </div>
        </Link>
    );
}

export default BlogCard;
```
これに、同じディレクトリ内に置いた``BlogCard.module.css``でCSSを当てることで、割と見栄えのいいカードが完成します。

![カードコンポーネント](/article/about-this-blog-v1_0_0/2.png)

### カードリストコンポーネント
---
先ほど作ったカードを素直に一覧ページに並べてもいいのですが、
どうせなら配列を渡してリストを返すようにした方が後々いい気がしたので、
その部分をコンポーネント化してみます。

``/src/components/BlogCardList``みたいなディレクトリを作りまして。その中に先ほどと同様に書き連ねていきます。
```TypeScript
import styles from "./BlogCardList.module.css"
import BlogCard from "../BlogCard/BlogCard"

interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

interface Post {
    frontMatter: FrontMatter;
    slug: string;
    content: string;
  }

interface BlogCardListProps {
    posts: Post[];
}

const BlogCardList = ({ posts } :BlogCardListProps) => {
    return (
        <div className={styles.cardList}>
            {posts.map((post) => (
                <div key={post.slug}>
                    <BlogCard post={post}/>
                </div>
            ))}
        </div>
    );
}

export default BlogCardList;
```
やってることはシンプルで、配列を受け取って、その要素一つ一つを``BlogCard``に籠めています。

### 一覧ページ
---
〆に、一覧ページを作っていきましょう。

``/src/app/blog/page.jsx``の中で、記事の配列を取ってきて、さっき作ったカードリストに渡して表示します。

```TypeScript
import styles from "./blog.module.css"
import { getAllPosts } from "@/lib/posts"
import BlogCardList from "@/components/BlogCardList/BlogCardList";

export default async function Blog() {
    const posts = await getAllPosts();
    return (
      <div>
        <h1 className={styles.title}>記事一覧</h1>
        <div className={styles.List}>
            <BlogCardList posts={posts}/>
        </div>
      </div>
    );
}
```
こんな感じ。

## 5.記事の内容取得と、HTML変換
---
記事一覧ページが出来たので、
リストのカードを押したらその記事の内容がみれるようにしたいと思います。

既に先ほど作ったカードの中にその仕掛けはしてあります。
```TypeScript
const BlogCard = ({ post } :BlogCardProps) => {
    return (
        <Link href={`/blog/${post.slug}`} passHref>
            <div className={styles.card}>
                <p className={styles.date}>{post.frontMatter.date}</p>
                <p className={styles.title}>{post.frontMatter.title}</p> 
                <p className={styles.description}>{post.frontMatter.description}</p>
            </div>
        </Link>
    );
}
```
``Link``タグが使われていますね。これによって、カードを押すと``/blog/[post.slug]``にページ遷移できます。

[post.slug]は記事固有の部分です。

まずは、``/src/app/blog/``の中に、``[slug]``というディレクトリを作ります。

### パスの生成
---
記事の数は増えたり減ったりするので、それぞれの記事の内容のURL``/blog/[post.slug]``は全部の記事を取得して、
それに応じて作っておく必要があります。

そこで使うのが、``generateStaticParams()``です。この関数の返り値としたものがパスとして生成されます。