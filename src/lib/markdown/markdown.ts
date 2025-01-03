import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeReact, { Components } from 'rehype-react';
import {Fragment, jsx, jsxs} from 'react/jsx-runtime';
import { Nodes } from "mdast";
import { Handler } from "mdast-util-to-hast";
import { tocPlugin, tweetPlugin, linkCardPlugin, print, codeHeaderPlugin } from "./plugins";
import { TableOfContentsItem } from '../type';
import { tweetHandler, divHandler, linkCardHandler, codeHeaderHandler } from './utils';
import { JSX } from 'react';
import { aHandler } from './utils/aHandler';

interface MarkdownContent {
    toc: TableOfContentsItem[];
    JSXElement: JSX.Element;
}

//remarkRehypeに渡すカスタムハンドラ
const remarkRehypeHandlers: Partial<Record<Nodes['type'], Handler>> = {
    tweet: tweetHandler, //tweetNodeノードに対する処理を定義
    linkCard: linkCardHandler, //linkCardノードに対する処理を定義
    codeHeader: codeHeaderHandler, //codeHeaderノードに対する処理を定義
};

//remarkReactに渡すカスタムハンドラ
const rehypeReactHandlers: Partial<Components> = {
    div: divHandler, //class付きdivをJSXコンポーネントに変換
    a: aHandler, //class付きaをJSXに変換
}

export async function markdownToJSX(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　JSX
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(tweetPlugin)
    .use(linkCardPlugin)
    .use(codeHeaderPlugin)
    .use(print)
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