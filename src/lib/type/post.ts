// 記事のメタデータの型
export type FrontMatter = {
    title: string;          
    description: string;    
    date: string;           
    tags?: string[];        
    series?: string;        
    pre?: string;           
    next?: string;            
}

//記事の型
export type Post = {
frontMatter: FrontMatter;
slug: string;
content: string;
}