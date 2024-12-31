import styles from "./BlogCard.module.css"
import Link from "next/link";
import { Post } from "@/lib/type";

interface BlogCardProps {
    post: Post;
}

const BlogCard = ({ post } :BlogCardProps) => {
    return (
        <Link href={`/blog/${post.slug}`} passHref>
            <div className={styles.card}>
                <p className={styles.date}>{post.frontMatter.date}</p>
                <p className={styles.title}>{post.frontMatter.title}</p> 
                <p className={styles.description}>{post.frontMatter.description}</p>
            </div>
        </Link>
    );
}

export default BlogCard;