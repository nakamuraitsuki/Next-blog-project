//メタデータの型
export type FrontMatter = {
    title: string;
    date: string;
    description: string;
}
  
//記事の型
export type Post = {
frontMatter: FrontMatter;
slug: string;
content: string;
}