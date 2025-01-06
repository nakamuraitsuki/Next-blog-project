import styles from "./Tweet.module.css";
import { ReactNode } from "react";

export const Tweet = ({ children }: {children: ReactNode} ) => {
    return(
        <div className={styles.wrap}>
            <div className={styles.tweet}>
                {children}
            </div>
        </div>
    )
}