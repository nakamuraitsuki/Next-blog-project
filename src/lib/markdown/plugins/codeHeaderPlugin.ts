import { Plugin } from "unified";
import { Node, Parent } from "unist";
import { Code } from "mdast";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
import { isParent } from "@/lib/markdown/utils"
import { CodeHeaderNode } from "@/lib/type";

export const codeHeaderPlugin: Plugin<[], Node, void> = () => {
    return (tree: Node, _file: VFile) => {
        //treeのCodeノードを訪れた時に、変換処理をする。
        visit(tree, 'code', (node: Code, index: number | undefined, parent: Parent | undefined ) => {
            //メタデータがない場合はただのコードブロックとして扱う
            if( !isParent(parent) || typeof index !== "number" || node.meta === null || node.meta === undefined){
                return;
            }
            const meta: string = node.meta;
            const value: string = node.value;

            parent.children[index] = {
                type: 'codeHeader',
                meta,
                value,
                children: [
                    {
                        type: 'code',
                        lang: node.lang,
                        meta: null,
                        value,
                    } as Code
                ],
            } as CodeHeaderNode
        })
    }
}