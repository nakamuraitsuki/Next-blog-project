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
  content: string;
}

const postDirectory = path.join(process.cwd(), 'posts');
//全記事のデータを取ってくる
export const getAllPosts = ():Post[] => {
  //ディレクトリのpathを元に中のファイルを読み取る
  const files = fs.readdirSync(postDirectory);
  //読み取ったものそれぞれの名前＋メタデータを配列籠める
  const posts: Post[] = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const filePath = path.join(postDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      frontMatter: data as FrontMatter,
      slug,
      content,
    };
  });
  //配列を返す
  return posts;
}

//特定の記事の内容取得
export const getPostBySlug = (slug: string): Post | null => {
  //ファイルの場所＋ファイル名でpathを完成させる
  const filePath = path.join(postDirectory, `${slug}.md`);
  //ファイルがあるならば処理を行う
  if(fs.existsSync(filePath)){
    //中身をutf-8として読み取る
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    return {
      frontMatter: data as FrontMatter,
      slug,
      content,
    };
  }
  return null;
}