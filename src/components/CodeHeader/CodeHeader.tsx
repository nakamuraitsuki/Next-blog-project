"use client"
import { ReactNode } from "react";
import styles from "./CodeHeader.module.css";
import { MdContentCopy } from "react-icons/md";

type CodeHeaderProps = {
    meta: string;
    value: string;
    children: ReactNode
};

export const CodeHeader = ({ meta, value, children }: CodeHeaderProps) => {

    return (
        <div>
            <div className={styles.header}>
                <p className={styles.meta}>{meta}</p>
                <button 
                    type="button" 
                    className={styles.button}
                    onClick={() => navigator.clipboard.writeText(value)}
                >
                    <MdContentCopy size={20}/>
                </button>
            </div>
            <div className={styles.children}>
                {children}
            </div>
        </div>
    )
}