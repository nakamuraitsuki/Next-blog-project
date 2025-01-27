import { Extension, Handle } from "mdast-util-from-markdown";
import { Token } from "micromark-util-types";
import { TweetNode } from "@/lib/type";
import { Text } from "mdast";

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
    }
}

//トークンからTweetノード作成
export const tweetFromMarkdownExtension = (): Extension => {
    return {
        enter: {
            tweetContainer: enterTweetContainer,
            tweetContainerContent: enterTweetContainerContent,
        },
        exit: {
            tweetContainerContent: exitTweetContainerContent,
            tweetContainer: exitTweetContainer,
        },
    };
}

const enterTweetContainer: Handle = function (token: Token) {
    const node: TweetNode = {
        type: 'tweet',
        children: [],
    }

    this.enter(node, token);
}

const enterTweetContainerContent: Handle = function (_token: Token) {
    this.buffer();
}

const exitTweetContainerContent: Handle = function (_token: Token) {
    const content = this.resume();
    const textNode: Text = {
        type: "text",
        value: content,
      };
    const currentNode = this.stack[this.stack.length-1] as TweetNode;
    currentNode.children.push(textNode);
}

const exitTweetContainer: Handle = function (token: Token) {
    this.exit(token);
};