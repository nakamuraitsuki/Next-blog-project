import Link from "next/link";
import { BreadcrumbsProps } from "@/lib";

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
    return (
        <div>
            {breadcrumbs.map((item) => (
                <Link key={item.name} href={item.path}>
                    {item.name}
                </Link>
            ))}
        </div>
    )
}