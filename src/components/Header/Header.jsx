import Link from 'next/link'
import styles from './Header.module.css'

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/">
                    ロゴ
                </Link>
                <div>リンク</div>
            </div>
        </header>
    );
}

export default Header;