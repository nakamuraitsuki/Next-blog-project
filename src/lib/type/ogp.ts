//メタデータセットの型
export type ogpData = {
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string | null;//TODO:nullの場合にはデフォルトアイコンを表示するようにする
}