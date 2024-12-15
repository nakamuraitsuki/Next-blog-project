interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

interface BlogCardProps {
    frontMatter: FrontMatter;
}

const BlogCard = ({ frontMatter } :BlogCardProps) => {
    return (
        <div>
            <p>{frontMatter.title}</p>
            <p>{frontMatter.date}</p>
            <p>{frontMatter.description}</p>
        </div>
    );
}

export default BlogCard;