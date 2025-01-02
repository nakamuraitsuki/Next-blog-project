import styles from "./LInkCard.module.css"
import { getOGP } from "@/lib";
import { ogpData } from "@/lib";
import Link from "next/link";
import { FaImage } from "react-icons/fa";

interface LinkCardProps {
    href: string | null;
}

export const LinkCard = async ({ href }: LinkCardProps) => {
    //hrefが空の場合
    if ( href === null ) {
        return (
            <div>
                Not Fount
            </div>
        )
    }

    const ogpDate: ogpData = await getOGP(href);

    return(
        <Link href={href} className={styles.LinkCard}>
            <div className={styles.flex}>
                <div className={styles.ogText}>
                    <p className={styles.ogTitle}>{ogpDate.ogTitle}</p>
                    <p className={styles.ogDescription}>{ogpDate.ogDescription}</p>
                </div>
                {ogpDate.ogImageUrl ? (
                    <div className={styles.imgWrap}>
                        <img
                        src={ogpDate.ogImageUrl} 
                        alt="OG Image" 
                        className={styles.img}
                        />
                    </div>
                ) : (
                    <FaImage size={40} />
                )}
            </div>
        </Link>
    )
}