"use client"

import styles from "./BlogCardList.module.css"
import { BlogCard } from "./BlogCard/BlogCard"
import { Post } from "@/lib/type";
import { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { Pagination } from "./Pagination/Pagination";

interface BlogCardListProps {
    posts: Post[];
    itemsPerPage: number;
    isPagination: boolean;
}

export const BlogCardList = ({ posts, itemsPerPage, isPagination } :BlogCardListProps) => {
    const [page, setPage] = useState(1);
    const [filteredPosts, setFilteredPosts] = useState(posts.slice(0, itemsPerPage))

    const handlePageChange = (_e: ChangeEvent<unknown>,newPage: number) => {
        setPage(newPage);
    }

    useEffect(() =>{
        setFilteredPosts(posts.slice((page-1)*itemsPerPage, page*itemsPerPage));
    },[page]);

    return (
        <div className={styles.wrap}>
            <div className={styles.cardList}>
                {filteredPosts.map((post) => (
                    <div key={post.slug}>
                        <BlogCard post={post}/>
                    </div>
                ))}
            </div>
            {isPagination ?
                <Pagination
                    posts={posts}
                    itemsPerPage={itemsPerPage}
                    page={page}
                    handlePageChange={handlePageChange}
                />
                :
                <div/>
            }
        </div>
    );
}