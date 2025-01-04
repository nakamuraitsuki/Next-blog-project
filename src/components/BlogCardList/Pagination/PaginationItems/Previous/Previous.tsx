import { UsePaginationItem } from "@mui/material/usePagination";
import { FaCaretLeft } from "react-icons/fa6";
import styles from "./Previous.module.css"

export const Previous = ({
    type,
    disabled,
    onClick
}: UsePaginationItem) => {
    return(
        <div>
            <button
                onClick={onClick}
                data-type={type}
                disabled={disabled}
                type="button"
                className={ disabled ? styles.active : styles.disabled }
            >
                <FaCaretLeft />
            </button>
        </div>
    )
}