import { Code } from "mdast";

export interface CodeHeaderNode {
    meta: string;
    value: string;
    children: Code;
}