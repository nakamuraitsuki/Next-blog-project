import { Components } from "rehype-react";
import { JSX } from "react";
import { ExtraProps } from "hast-util-to-jsx-runtime";
import { Tweet } from "@/components/Tweet/Tweet";

export const divHandler: Components['div'] = (props: JSX.IntrinsicElements['div'] & ExtraProps): JSX.Element => {
    //分割代入で展開
    const { node, className, ...restProps } = props;

    if (className === 'tweet') {
        return <Tweet>{props.children}</Tweet>;
    }

    return <div {...restProps} />;
};