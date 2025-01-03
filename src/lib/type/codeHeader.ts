import { Code } from "mdast";

export interface CodeHeaderNode {
    type: 'codeHeader'
    meta: string;
    value: string;
    children: Code;
}