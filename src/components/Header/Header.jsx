import Link from 'next/link'
import styles from './Header.module.css'

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/">
                    しゃべる葦原
                </Link>
                <div className={styles.links}>
                    <div>記事一覧</div>
                    <div>著者について</div>
                </div>
            </div>
        </header>
    );
}

export default Header;