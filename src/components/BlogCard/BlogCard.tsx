interface FrontMatter {
    title: string;
    date: string;
    description: string;
}

const BlogCard = ({title, date, description} :FrontMatter) => {
    return (
        <div>
            <p>{title}</p>
            <p>{date}</p>
            <p>{description}</p>
        </div>
    );
}

export default BlogCard;