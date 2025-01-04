import { UsePaginationItem } from "@mui/material/usePagination";
import styles from "./Page.module.css"

export const Page = ({
    type,
    page,
    selected,
    disabled,
    onClick
}: UsePaginationItem) => {
    return(
        <div>
            <button
                onClick={onClick}
                data-type={type}
                disabled={disabled}
                data-selected={selected}
                type="button"
                className={ selected ? styles.selected : styles.unselected }
            >
                {page}
            </button>
        </div>
    )
}