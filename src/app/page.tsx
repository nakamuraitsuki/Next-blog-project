import styles from "./page.module.css"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"

export default function Home() {
  return (
    <div>
      <Header/>
      <main className={styles.content}>
        <div className={styles.title}>
          <h1>しゃべる葦原</h1>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
