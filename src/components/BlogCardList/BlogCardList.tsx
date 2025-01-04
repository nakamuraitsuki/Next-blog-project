"use client"

import styles from "./BlogCardList.module.css"
import { BlogCard } from "../BlogCard/BlogCard"
import { Post } from "@/lib/type";
import { useEffect, useState } from "react";
import usePagination from "@mui/material/usePagination";
import { ChangeEvent } from "react";

interface BlogCardListProps {
    posts: Post[];
    itemsPerPage: number;
}

export const BlogCardList = ({ posts, itemsPerPage } :BlogCardListProps) => {
    const [page, setPage] = useState(1);
    const [filteredPosts, setFilteredPosts] = useState(posts.slice(0, itemsPerPage))

    const count = Math.ceil(posts.length/itemsPerPage);
    //以降ページネーション
    //ページ遷移関数
    const handlePageChange = (_e: ChangeEvent<unknown>,newPage: number) => {
        setPage(newPage);
    }
    //並べるアイテム配列
    const { items } = usePagination({
        count: count, //総ページ数(繰り上げ計算)
        page: page,                   //現在いるページ
        onChange: handlePageChange,   //ページ遷移関数
        siblingCount: 1,
        boundaryCount: 1,
    });

  //表示ラベル
  const getLabel = (type: string, page: number) => {
    switch (type) {
      case 'start-ellipsis':
      case 'end-ellipsis':
        return '...';
      case 'previous':
        return 'previous';
      case 'next':
        return 'next';
      default:
        return page;
    }
  };

    useEffect(() =>{
        setFilteredPosts(posts.slice((page-1)*itemsPerPage, page*itemsPerPage));
    },[page]);

    return (
        <div>
            <div className={styles.cardList}>
                {filteredPosts.map((post) => (
                    <div key={post.slug}>
                        <BlogCard post={post}/>
                    </div>
                ))}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'center'}}>
                {items.map(({ type, page, selected, disabled, onClick}, index) => (
                    <button
                        key={index}
                        onClick={onClick}
                        data-selected={selected}
                        disabled={disabled}
                        type="button"
                        style={selected ? {backgroundColor: 'red'}:{}}
                    >
                    {getLabel(type, (page ?? 1))}
                    </button>
                ))}
            </div>
        </div>
    );
}