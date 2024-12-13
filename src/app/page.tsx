import styles from "./page.module.css"
import Layout from "@/components/Layout/Layout"

export default function Home() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1>HOME</h1>
      </div>
    </Layout>
  );
}
