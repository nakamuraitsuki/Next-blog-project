import styles from "./Pagination.module.css"
import usePagination from "@mui/material/usePagination";
import { Post } from "@/lib";
import { ReactNode, ReactEventHandler } from "react";
import { Ellipsis } from "./PaginationItems/Ellipsis/Ellipsis";
import { Previous } from "./PaginationItems/Previous/Previous";
import { Next } from "./PaginationItems/Next/Next";
import { Page } from "./PaginationItems/Page/Page";

interface PaginationProps {
    posts: Post[];
    itemsPerPage: number;
    page: number;
    handlePageChange: ((event: React.ChangeEvent<unknown>, page: number) => void)
}

export const Pagination = ({ posts, itemsPerPage, page, handlePageChange }: PaginationProps): ReactNode => {

    const count = Math.ceil(posts.length/itemsPerPage);

    //並べるアイテム配列
    const { items } = usePagination({
        count: count, //総ページ数(繰り上げ計算)
        page: page, //現在いるページ
        onChange: handlePageChange, //ページ遷移関数
        siblingCount: 1,
        boundaryCount: 1,
    });

    //表示JSXをタイプによって取得
    const getReactNode = (
        key: number,
        type: string, 
        page: number, 
        selected: boolean, 
        disabled: boolean, 
        onClick: ReactEventHandler<Element>
    ) => {
        if(onClick === null) {
            return;
        }

        switch (type) {
        case 'start-ellipsis':
        case 'end-ellipsis':
            return <Ellipsis key={key}/>;
        case 'previous':
            return <Previous key={key} type='previous' page={page}  selected={selected} disabled={disabled} onClick={onClick} />;
        case 'next':
            return <Next key={key} type='next' page={page}  selected={selected} disabled={disabled} onClick={onClick}/>;
        default:
            return <Page key={key} type='page' page={page}  selected={selected} disabled={disabled} onClick={onClick}/>;
        }
    };

    return(
        <div className={styles.pagination}>
            {items.map(({ type, page, selected, disabled, onClick}, index) => (
                getReactNode(index, type, page ?? 1, selected, disabled, onClick)
            ))}
        </div>
    )
}