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