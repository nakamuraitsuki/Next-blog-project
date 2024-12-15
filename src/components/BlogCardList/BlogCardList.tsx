import styles from "./BlogCardList.module.css"
import BlogCard from "../BlogCard/BlogCard"

interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

interface Post {
    frontMatter: FrontMatter;
    slug: string;
    content: string;
  }

interface BlogCardListProps {
    posts: Post[];
}

const BlogCardList = ({ posts } :BlogCardListProps) => {
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

export default BlogCardList;
