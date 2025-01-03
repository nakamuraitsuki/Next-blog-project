import { Handler, State } from "mdast-util-to-hast";
import { TweetNode } from "@/lib/type";

export const codeHeaderHandler: Handler = (h: State, node: TweetNode) => {
    return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["codeHeader"],
        },
        children: h.all(node),
      };
}