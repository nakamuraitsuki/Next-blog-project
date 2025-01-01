import { TweetNode, LinkCardNode } from "../type"

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
        linkCard: LinkCardNode;//LinkCardNodeを許容するよう設定
    }
}