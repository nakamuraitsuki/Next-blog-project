import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { Nodes } from "mdast";
import { Handler } from "mdast-util-to-hast"
import { tocPlugin, tweetPlugin } from "./plugins"
import { TableOfContentsItem } from '../type';
import { tweetHandler } from './utils';

interface MarkdownContent {
    toc: TableOfContentsItem[];
    html: string;
}

//remarkRehypeに渡す拡張ハンドラ
const handlers: Partial<Record<Nodes['type'], Handler>> = {
    tweet: tweetHandler
};

export async function markdownToHTML(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //markdown →　HTML
    const result = await unified()
    .use(remarkParse)
    .use(tocPlugin, {toc: tableOfContents})//目次抽出
    .use(tweetPlugin)
    .use(remarkGfm)
    .use(remarkRehype, { handlers })
    .use(rehypeHighlight)
    .use(rehypeSlug)//id付与
    .use(rehypeStringify)
    .process(content);

    return {
        toc: tableOfContents,
        html: result.toString()
    };
}