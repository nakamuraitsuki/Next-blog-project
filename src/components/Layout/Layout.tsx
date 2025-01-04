import styles from "./Layout.module.css"
import { Header } from "./Header/Header"
import { Footer } from "./Footer/Footer"
import { Breadcrumbs } from "./Breadcrumbs/Breadcrumbs"
import { ReactNode } from "react"
import { BreadcrumbsItem } from "@/lib"

interface LayoutProps {
    breadcrumbs: BreadcrumbsItem[];
    children: ReactNode;
}

export const Layout = ({ breadcrumbs ,children }: LayoutProps) => {
    return (
        <div>
            <Header/>
            <Breadcrumbs breadcrumbs={breadcrumbs}/>
            <main className={styles.main}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}