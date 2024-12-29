import { Plugin } from "unified";
import { Node } from "unist";
import { VFile } from "vfile";
import { inspect } from "unist-util-inspect";

const print: Plugin = () => {
  return (tree: Node, _file: VFile) => {
    console.log(inspect(tree));
  };
};

export default print;