import { notFound } from "next/navigation";
import Layout from "../../../components/Layout/Layout"
import { getAllPosts, getPostBySlug } from "@/lib/posts"
import { markdownToHTML } from "@/lib/markdown";

interface PostProps {
    params: { slug: string }
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Slug({ params }: PostProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if(!post) {
        notFound();
    }
    const html = await markdownToHTML(post.content);

    return (
        <Layout>
            <h1>{post.frontMatter.title}</h1>
            <p>{post.frontMatter.date}</p>
            <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </Layout>
    )
}