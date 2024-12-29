import { isParagraph, isText } from "./nodeUtils";
import { Paragraph } from "mdast";

const TWEET_BEGGINING = ":::tweet\n";
const TWEET_ENDING = "\n:::";

export function isTweet(node: unknown): node is Paragraph {
    //paragraphじゃなかったらTweetでもない
    if (!isParagraph(node)) {
        return false;
    }

    //分割代入によってchildrenプロパティを抽出
    const { children } = node;

    //":::tweet\nで始まっていなかったらTweet記法じゃない"
    const firstChild = children[0];
    if (!(isText(firstChild) && firstChild.value.startsWith(TWEET_BEGGINING))) {
        return false;
    }

    //":::で終わってなかったらTweet記法じゃない"
    const lastChild = children[children.length -1];
    if (!(isText(lastChild) && lastChild.value.endsWith(TWEET_ENDING))) {
        return false;
    }

    return true;
}