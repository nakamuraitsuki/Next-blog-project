import styles from "./about.module.css"
import Layout from "@/components"

function ProfileText() {
    return(
        <div className={styles.profile}>
            <img 
                src="/icon/apple_icon.jpg" 
                alt="icon"
                className={styles.icon}
            />
            <div>
                <p className={styles.name}>nakamuraitsuki</p>
                <p>埼玉大学工学部情報工学科の2年生</p>
                <p>
                    <a 
                    href="https://maximum.vc/"
                    className={styles.foreignLink}
                    >
                        プログラミングサークルMaximum
                    </a>
                    と
                    <a
                        href="http://mcs.xrea.jp/"
                        className={styles.foreignLink}
                    >
                        埼玉大学推理小説研究会
                    </a>
                    に所属
                </p>
            </div>
        </div>
    )
}

function Profile() {
    return(
        <div>
            <h2 className={styles.title}>
                サイト作成者のプロフィール
            </h2>
            <ProfileText/>
        </div>
    )
}

function Description() {
    return(
        <div>
            <p>
                プログラミングと読書が趣味です。
            </p>
            <p>
                音楽を聴くのも好きで、通学中によく聴いています。たまにお絵かきもしたりします。
            </p>
            <p>
                本の虫の一歩手前。好きな著者は太田紫織→西尾維新→米澤穂信→森博嗣→青崎有吾→白居智之…と変遷しています。
            </p>
            <p>
                プログラミングは大学進学してから学び始め、現在精進中です。
            </p>
            <p>
                ちょこちょこと調べながらWebサイトを構成してみたり、
                C++を使って競技プログラミングをやってみたりしています。
            </p>
            <h3 className={styles.section}>ちょっと技術的なこと</h3>
            <p>
                触ったことのある言語としてはC・C++・Java・
                JavaScript・TypeScript・GO等があります。
            </p>
            <p>個人開発でフロントエンドとバックエンドの両方を触った経験があります。</p>
        </div>
    )
}

function AboutText() {
    return(
        <div>
            <h2 className={styles.title}>このサイトの存在理由</h2>
            <p>
                自分自身が学んだことや
                感情が動いたことを忘れないために、備忘録的な記事を書きたいと思い至り
                このブログを作りました。
            </p>
            <p>
                周りの人にはわざわざ言わないような事を、
                深く掘った穴に叫ぶような気持ちで書いていこうと思っています。
                サイトの名前『しゃべる葦原』はその思いが由来です。
            </p>
        </div>
    )
}

export default function About() {
    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.hero}>About</h1>
                <div className={styles.contents}>
                    <Profile/>
                    <Description/>
                    <AboutText/>
                </div>
            </div>
        </Layout>
    );
}