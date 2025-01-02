import { Components } from "rehype-react";
import { JSX } from "react";
import { ExtraProps } from "hast-util-to-jsx-runtime";
import { LinkCard } from "@/components";

export const aHandler: Components['a'] = (props: JSX.IntrinsicElements['a'] & ExtraProps): JSX.Element => {
    //分割代入で展開
    const { node, className, href, ...restProps } = props;

    if (className === 'linkCard') {
        const url = href ?? null;
        return <LinkCard href={url}/>;
    }

    return <a {...restProps} />;
};