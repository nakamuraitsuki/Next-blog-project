import { notFound } from "next/navigation";
import Layout from "../../../components/Layout/Layout"
import { getPostBySlug } from "../../../lib/posts"

interface PostProps {
    params: { slug: string }
}

export default function Slug({ params }: PostProps) {
    console.log("スラグ",params.slug)
    const post = getPostBySlug(params.slug);

    if(!post) {
        notFound();
    }

    return (
        <Layout>
            <h1>{post.frontMatter.title}</h1>
            <p>{post.frontMatter.date}</p>
            <p>{post.content}</p>
        </Layout>
    )
}