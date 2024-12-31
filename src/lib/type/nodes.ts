import { TweetNode } from "./tweet";

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
    }
}