import { Plugin } from "unified";
import { Node, Parent } from "unist";
import { Paragraph, PhrasingContent, Text } from "mdast";
import { VFile } from "vfile";
import { visit } from "unist-util-visit";
import { TweetNode } from "@/lib/type";
import { isParent, isTweet, processFirstChild, processLastChild } from "../utils";

const TWEET_BEGGINING = ":::tweet\n";//記法の始まり
const TWEET_ENDING = "\n:::";//記法の終わり

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