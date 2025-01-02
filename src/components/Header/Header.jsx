import Link from 'next/link'
import styles from './Header.module.css'

export const Header = () => {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.title}>
                しゃべる葦原
            </Link>
            <div className={styles.linkList}>
                <Link href="/blog" className={styles.link}>
                    記事一覧
                </Link>
                <Link href="/about" className={styles.link}>
                    About
                </Link>
            </div>
        </header>
    );
}