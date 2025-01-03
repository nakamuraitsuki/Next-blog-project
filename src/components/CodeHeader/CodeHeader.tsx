import { CodeHeaderProps } from "@/lib"

export const CodeHeader = ({ meta, value, children }: CodeHeaderProps) => {
    return (
        <div>
            <div>
                {meta}
                {value}
            </div>
            {children}
        </div>
    )
}