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
    console.log("from markdown extension");
    return {
        enter: {
            tweetContainer: enterTweetContainer,
        },
        exit: {
            tweetContainerContent: exitTweetContainerContent,
            tweetContainer: exitTweetContainer,
        },
    };
}

const enterTweetContainer: Handle = function (token: Token) {
    console.log("---------node start---------");
    console.log("enter tweet container");
    console.log("token:",token);
    const node: TweetNode = {
        type: 'tweet',
        children: [],
    }

    this.enter(node, token);
}

const exitTweetContainerContent: Handle = function (token: Token) {
    console.log("exit tweet container content")
    console.log("token:",token)
    const content = (this.sliceSerialize(token)).replace(/::$/, "");
    console.log("content:",content);
    const textNode: Text = {
        type: "text",
        value: content,
      };
    const currentNode = this.stack[this.stack.length-1] as TweetNode;
    currentNode.children.push(textNode);
}

const exitTweetContainer: Handle = function (token: Token) {
    console.log("exti tweet container")
    console.log("token:",token)
    this.exit(token);
};