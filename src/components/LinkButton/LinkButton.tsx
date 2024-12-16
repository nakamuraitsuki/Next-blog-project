import Link from "next/link";
import styles from "./LinkButton.module.css"


interface LinkButtonProps {
    href: string;
    text: string;
}

const LinkButton = ({ href, text }: LinkButtonProps) => {
    return(
        <Link href={href} className={styles.button}>
            <p className={styles.text}>{text}</p>
        </Link>
    )
}

export default LinkButton;