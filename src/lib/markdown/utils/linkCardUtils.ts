import { isLink, isParagraph, isText } from "./nodeUtils";
import { Paragraph } from "mdast";


//TODO:改行が\r\nと認識されるときの対処（エディター依存にしたくない）
const LINK_CARD_BEGGINING = ":::linkCard\n";
const LINK_CARD_ENDING = "\n:::";

export function isLinkCard(node: unknown): node is Paragraph {
    //paragraphじゃなかったらLinkCardでもない
    if (!isParagraph(node)) {
        return false;
    }
    console.log(node.children.length);
    //分割代入によってchildrenプロパティを抽出
    const { children } = node;

    //子要素はLinkとそれを挟むテキストのみ
    if(children.length !== 3 || !isLink(children[1])){
        console.log("個数不一致");
        return false;
    }

    //":::linkCard\nで始まっていなかったらlinkCard記法じゃない"
    const firstChild = children[0];
    if (!(isText(firstChild) && firstChild.value.startsWith(LINK_CARD_BEGGINING))) {
        console.log("先頭不一致");
        return false;
    }

    //":::\nで終わってなかったらlinkCard記法じゃない"
    const lastChild = children[children.length -1];
    if (!(isText(lastChild) && lastChild.value.endsWith(LINK_CARD_ENDING))) {
        console.log("末尾不一致");
        return false;
    }

    return true;
}
