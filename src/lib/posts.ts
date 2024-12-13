import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface FrontMatter {
  title: string;
  date: string;
  description: string;
}

interface Post {
  frontMatter: FrontMatter;
  slug: string;
}

export const getAllPosts = ():Post[] => {
  const postDirectory = path.join(process.cwd(), 'posts');
  const files = fs.readdirSync(postDirectory);

  const posts: Post[] = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const filePath = path.join(postDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    return {
      frontMatter: data as FrontMatter,
      slug,
    };
  });

  return posts;
}