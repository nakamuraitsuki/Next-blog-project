import styles from "./BlogCardList.module.css"
import { BlogCard } from "../BlogCard/BlogCard"
import { Post } from "@/lib/type";

interface BlogCardListProps {
    posts: Post[];
}

export const BlogCardList = ({ posts } :BlogCardListProps) => {
    return (
        <div className={styles.cardList}>
            {posts.map((post) => (
                <div key={post.slug}>
                    <BlogCard post={post}/>
                </div>
            ))}
        </div>
    );
}