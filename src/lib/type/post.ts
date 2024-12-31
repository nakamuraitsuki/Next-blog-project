//メタデータの型
export interface FrontMatter {
    title: string;
    date: string;
    description: string;
}
  
//記事の型
export interface Post {
frontMatter: FrontMatter;
slug: string;
content: string;
}