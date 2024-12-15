interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

const BlogCard = (frontMatter :FrontMatter) => {
    return (
        <div>
            <p>{frontMatter.title}</p>
            <p>{frontMatter.date}</p>
            <p>{frontMatter.description}</p>
        </div>
    );
}

export default BlogCard;