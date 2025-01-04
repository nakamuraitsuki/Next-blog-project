import { UsePaginationItem } from "@mui/material/usePagination";
import styles from "./Next.module.css"
import { FaCaretRight } from "react-icons/fa";

export const Next = ({
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
                <FaCaretRight />
            </button>
        </div>
    )
}