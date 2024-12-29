import { Plugin } from "unified";
import { Node } from "unist";
import { Heading } from "mdast";
import{ VFile } from "vfile";
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

export const tocPlugin: Plugin<[TocPluginProps],Node,void> = ({ toc }) => {
    return (tree: Node, _file: VFile) => {
        visit(tree, 'heading', (node: Heading) => {
            //レヴェルとテキスト、ID抽出
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
