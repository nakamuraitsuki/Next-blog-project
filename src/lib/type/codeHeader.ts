import { Code } from "mdast";

export interface CodeHeaderNode extends Node {
    type: 'codeHeader'
    meta: string;
    value: string;
    children: Code[];
}