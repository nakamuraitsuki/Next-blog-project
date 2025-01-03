import { Handler, State } from "mdast-util-to-hast";
import { CodeHeaderNode } from "@/lib/type";

export const codeHeaderHandler: Handler = (h: State, node: CodeHeaderNode) => {
    return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["codeHeader"],
          meta: node.meta,
          value: node.value,
        },
        children: h.all(node),
      };
}