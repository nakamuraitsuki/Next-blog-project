import { Components } from "rehype-react";
import { JSX } from "react";
import { ExtraProps } from "hast-util-to-jsx-runtime";
import { Tweet, CodeHeader } from "@/components";

export const divHandler: Components['div'] = (
    props: JSX.IntrinsicElements['div'] & 
    ExtraProps & 
    { 
        'data-meta': string | null;
        'data-value': string | null;
    }//divに持たせたデータを許容する
): JSX.Element => {
    //分割代入で展開
    const { node, className, ...restProps } = props;

    if( className === 'tweet' ) {
        return <Tweet>{props.children}</Tweet>;
    }

    if( className === 'codeHeader' ) {
        const meta = props['data-meta'];
        const value = props['data-value'];
        if( meta !== null && value !== null) {
            return (
                <CodeHeader
                    meta={meta}
                    value={value}
                >
                    {restProps.children}
                </CodeHeader>
            )
        }
    }

    return <div {...restProps} />;
};