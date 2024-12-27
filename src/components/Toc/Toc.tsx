import Link from "next/link";
import styles from "./Toc.module.css";

interface TableOfContentsItem {
    level: number;
    text: string;
    id: string;
};

interface TocProps {
    toc: TableOfContentsItem[];
}

const Toc = ({toc}: TocProps) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>目次</h3>
            <div className={styles.toc}>
                {toc.map((item, index) => (
                    <Link 
                        className={styles[`item${item.level}`]}
                        href={`#${item.id}`} 
                        key={index} 
                    >
                        {item.text}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Toc;