import { Node as MdastNode, PhrasingContent } from "mdast";

//Tweet用のNode
export interface TweetNode extends MdastNode {
    type: 'tweet';
    children: PhrasingContent[];
}