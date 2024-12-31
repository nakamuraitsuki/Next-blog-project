import { PhrasingContent } from "mdast"
import { isText } from "./nodeUtils";

export function processFirstChild (children: Array<PhrasingContent>, identifier: string) {
    if(isText(children[0])){
        const firstChild = children[0];
        const firstValue = firstChild.value;
        if(firstValue === identifier) {//記法の頭に一致していたら
            children.shift();//丸ごと取り除く
        } else {//記法＋文字だったら
            //記法の部分だけ取り除く
            children[0] = {
                ...firstChild,
                value: firstValue.slice(identifier.length),
            };
        }
    }
}

export function processLastChild (children: Array<PhrasingContent>, identifier: string) {
    const lastIndex = children.length - 1;
    if(isText(children[lastIndex])){
        const lastChild = children[lastIndex];
        const lastValue = lastChild.value as string;
        if (lastValue === identifier) {//記法の末尾に一致していたら
          children.pop();//丸ごと取り除く
        } else {//記法の末尾に一致していなかったら
            //記法の部分だけ取り除く
            children[lastIndex] = {
            ...lastChild,
            value: lastValue.slice(0, lastValue.length - identifier.length),
            };
        }
    }
}