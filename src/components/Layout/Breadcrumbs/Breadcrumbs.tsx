import Link from "next/link";
import styles from "./Breadcrumbs.module.css"
import { BreadcrumbsProps } from "@/lib";
import { JSX, ReactNode } from "react";
import { FaChevronRight, FaHome } from "react-icons/fa";

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps): JSX.Element => {
    //配列を元に、">"やリンクを組み込んだパンくずリストを作成する関数
    const breadcrumbsTable = breadcrumbs.map((item, index): ReactNode => {
        if( index === 0) {
            return (
                <div key={index} className={styles.breadcrumbsItem}>
                    <Link href={item.path}  className={styles.link} passHref>
                        {item.name}
                    </Link>
                </div>
            )
        }
        return (
            <div key={index} className={styles.breadcrumbsItem}>
                <FaChevronRight className={styles.right}/>
                <Link href={item.path} className={styles.link} passHref>
                    {item.name}
                </Link>
            </div>
        )
    });
    
    return (
        <div className={styles.breadcrumbs}>
            <FaHome className={styles.home} />
            {breadcrumbsTable}
        </div>
    )
}