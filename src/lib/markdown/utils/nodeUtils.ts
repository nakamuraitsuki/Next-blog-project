import { Node, Parent, Literal } from "unist";
import { Paragraph, Text } from "mdast";

function isObject(target: unknown): target is { [key: string]: unknown } {
    return typeof target === "object" && target !== null;
}

export function isNode(node: unknown): node is Node {
    return isObject(node) && "type" in node;
}

export function isParent(node: unknown): node is Parent {
    return isObject(node) && Array.isArray(node.children);
}

export function isLiteral(node: unknown): node is Literal {
    return isObject(node) && "value" in node;
}

export function isParagraph(node: unknown): node is Paragraph {
    return isNode(node) && node.type === "paragraph";
}

export function isText(node: unknown): node is Text {
    return (
        isLiteral(node) && node.type === "text" && typeof node.value === "string"
    );
}