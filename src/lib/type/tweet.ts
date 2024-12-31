import { PhrasingContent } from "mdast";

//Tweet用のNode
export interface TweetNode extends Node {
    type: 'tweet';
    children: PhrasingContent[];
}