import styles from "./Layout.module.css"
import { Header } from "../Header/Header"
import { Footer } from "../Footer/Footer"

export const Layout = ({ children }) => {
    return (
        <div>
            <Header/>
            <main className={styles.main}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}