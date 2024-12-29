import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { print, tocPlugin, tweetPlugin } from "./plugins"

// 目次の型
interface TableOfContentsItem {
    level: number;
    text: string;
    id: string;
};

interface MarkdownContent {
    toc: TableOfContentsItem[];
    html: string;
}


export async function markdownToHTML(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

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

    return {
        toc: tableOfContents,
        html: result.toString()
    };
}