import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit'
import { Heading, PhrasingContent } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown';

// 目次の型
interface TableOfContentsItem {
    level: number;
    text: string;
};

interface MarkdownContent {
    toc: TableOfContentsItem[];
    html: string;
}


export async function markdownToHTML(content: string): Promise<MarkdownContent> {
    const tableOfContents: TableOfContentsItem[] = [];

    //目次抽出用mdastを作成
    const tree = fromMarkdown(content);

    visit(tree, 'heading', (node: Heading) => {
        // レベルとテキスト内容を抽出
        const level = node.depth; // 見出しレベル
        const text = node.children
        .filter(child => child.type === 'text') // 'text' 型のノードのみフィルター
        .map(child => child.value) // 'text' 型ノードの 'value' プロパティを取得
        .join('');
    
        tableOfContents.push({ level, text});
    });

    console.log(tableOfContents);

    //markdown →　HTML
    const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content);

    return {
        toc: tableOfContents,
        html: result.toString()
    };
}