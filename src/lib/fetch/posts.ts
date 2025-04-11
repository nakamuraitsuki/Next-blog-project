import fs from 'fs/promises'; //fsモジュール（非同期版）
import path from 'path'; //pathをつかさどる
import matter from 'gray-matter';
import { FrontMatter, Post, Series } from '../type';

//起動時にルートディレクトリを得て、ルート直下のpostsディレクトリパスにする
const postDirectory = path.join(process.cwd(), 'posts');

// 全記事のデータを取得
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    // ディレクトリ内のファイルを非同期で読み取る
    const files = await fs.readdir(postDirectory);
    // 各ファイルの内容を処理
    const posts: Post[] = await Promise.all(
      files.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');//.mdを消して名前だけにする(slug)
        const filePath = path.join(postDirectory, fileName);//読み取るファイルの位置を特定
        const fileContent = await fs.readFile(filePath, 'utf-8'); // 非同期読み込み
        const { data, content } = matter(fileContent);//メタデータと本文を抽出

        //returnの内容がpostsに入れられていく
        return {
          frontMatter: data as FrontMatter,
          slug,
          content,
        };
      })
    );

    //日付順にソート
    const sortedPosts = posts.sort((postA, postB) =>
      new Date(postA.frontMatter.date) > new Date(postB.frontMatter.date) ? -1 : 1
    );
    
    return sortedPosts;//ソートした記事の配列を返す。
  } catch (error) {
    console.error('Error reading posts:', error);
    return []; // エラー時は空の配列を返す
  }
};

// シリーズの一覧を取得
export const getAllSeries = async (): Promise<Series[]> => {
  try {
    const posts = await getAllPosts();
    const seriesMap: Map<string, Series> = new Map();

    posts.forEach((post) => {
      const s = post.frontMatter.series || "none";

      if (!seriesMap.has(s)) {
        seriesMap.set(s, {
          name: s,
          size: 0,
          posts: [],
        });
      }

      const seriesEntry = seriesMap.get(s);
      if (seriesEntry) {
        seriesEntry.posts.push(post);
        seriesEntry.size += 1;
      }
    });

    return Array.from(seriesMap.values());
  } catch (error) {
    console.error("Error reading all series:", error);
    return [];
  }
};

// 特定の記事の内容を取得
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    // ファイルのパスを生成
    const filePath = path.join(postDirectory, `${slug}.md`);

    // ファイルが存在するか確認
    try {
      await fs.access(filePath); // ファイルの存在を確認
    } catch {
      return null; // 存在しない場合はnullを返す
    }

    // ファイル内容を非同期で読み取る
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      frontMatter: data as FrontMatter,
      slug,
      content,
    };
  } catch (error) {
    console.error(`Error reading post by slug: ${slug}`, error);
    return null; // エラー時はnullを返す
  }
};

export const getPostsBySeries = async (series: string | null): Promise<Series | null> => {
  try {
    const posts = await getAllPosts(); // 全記事を取得

    const seriesPosts = posts.filter((post) => {
      const s = post.frontMatter.series;

      if (series === "none") {
        return s == null; // null または undefined の記事だけ
      }

      return s === series;
    });

    return {
      name: series,
      size: seriesPosts.length,
      posts:seriesPosts,
    } as Series;
  } catch (error) {
    console.error(`Error reading posts by series: ${series}`, error);
    return null;
  }
};
