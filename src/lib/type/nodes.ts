import { TweetNode, LinkCardNode, CodeHeaderNode } from "../type"

declare module 'mdast' {
    interface RootContentMap {
        tweet: TweetNode;//TweetNodeを許容するよう設定
        linkCard: LinkCardNode;//LinkCardNodeを許容するよう設定
        codeHeader: CodeHeaderNode;//CodeHeaderNodeを許容するよう設定
    }
}