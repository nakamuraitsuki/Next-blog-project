import { Handler, State } from "mdast-util-to-hast";
import { isParagraph, isText, isLink } from "./nodeUtils";
import { Paragraph } from "mdast";
import { LinkCardNode } from "@/lib/type";


//TODO:改行が\r\nと認識されるときの対処（エディター依存にしたくない）
const LINK_CARD_BEGGINING = ":::linkCard\n";
const LINK_CARD_ENDING = "\n:::";

export function isLinkCard(node: unknown): node is Paragraph {
    //paragraphじゃなかったらLinkCardでもない
    if (!isParagraph(node)) {
        return false;
    }

    //分割代入によってchildrenプロパティを抽出
    const { children } = node;

    //子要素はLinkとそれを挟むテキストのみ
    if(children.length !== 3 || !isLink(children[1])){
        return false;
    }

    //":::linkCard\nで始まっていなかったらlinkCard記法じゃない"
    const firstChild = children[0];
    if (!(isText(firstChild) && firstChild.value.startsWith(LINK_CARD_BEGGINING))) {
        return false;
    }

    //":::\nで終わってなかったらlinkCard記法じゃない"
    const lastChild = children[children.length -1];
    if (!(isText(lastChild) && lastChild.value.endsWith(LINK_CARD_ENDING))) {
        return false;
    }

    return true;
}

export const linkCardHandler: Handler = (_h: State, node: LinkCardNode) => {
    return {
        type: "element",
        tagName: "a",
        properties: {
            href: node.url,
            className: ["linkCard"],
        },
        children: []
      };
}