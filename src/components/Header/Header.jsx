import Link from 'next/link'
import styles from './Header.module.css'

const Header = () => {
    return (
        <header className={styles.header}>
            <Link href="/">
                しゃべる葦原
            </Link>
            <div className={styles.linkList}>
                <Link href="/blog">記事一覧</Link>
                <Link href="/about">著者について</Link>
            </div>
        </header>
    );
}

export default Header;