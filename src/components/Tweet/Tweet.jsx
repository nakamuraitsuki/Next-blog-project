import styles from "./Tweet.module.css";

export const Tweet = ({ children }) => {
    return(
        <div className={styles.tweet}>
            {children}
        </div>
    )
}