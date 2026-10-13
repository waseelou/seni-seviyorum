import { useEffect, useRef, useState } from "react";

// Write your letter here. Each line in quotes is one line; "" is an empty line.
const LETTER = [
  "Sevgilim, ❤️",
  "",
  "Bugün, hayatımın en güzel günlerinden biri… Çünkü bugün seninle sevgili olarak geçirdiğimiz ikinci yılımızın yıl dönümü.",
  "",
  "İki yıl önce belki de hayatımın bu kadar güzelleşeceğini, bir insanın bana bu kadar çok şey hissettirebileceğini bilmiyordum. Ama şimdi geriye dönüp baktığımda, seni tanımanın ve seninle bu yola çıkmanın hayatımın en güzel şanslarından biri olduğunu anlıyorum.",
  "",
  "Seninle geçirdiğim her an, birlikte güldüğümüz her şey, birbirimize anlattığımız küçücük şeyler bile benim için çok değerli. Bazen sadece seninle konuşmak, sesini duymak ya da yanında olmak bile bütün günümü güzelleştirmeye yetiyor.",
  "",
  "Belki her zaman mükemmel değiliz, bazen tartışıyoruz, bazen birbirimize uyuz oluyoruz ama bütün bunların arasında değişmeyen tek bir şey var: Seni seviyorum. ❤️",
  "",
  "Hem de sadece güzel günlerde değil, zor günlerde de, her şey yolundayken de, birbirimize katlanamadığımız anlarda bile… Çünkü benim için önemli olan her zaman mükemmel olmak değil, bütün bunlara rağmen birbirimizi seçmeye devam etmek.",
  "",
  "Ha, biraz uyuzsun, biraz gıcıksın, bazen insanı çileden çıkarmayı da çok iyi biliyorsun 😂❤️ Ama ne yapalım, kalbim seni seçmiş bir kere, artık geri dönüş yok.",
  "",
  "Seni bütün o tatlı sinir bozucu hâllerinle, gülüşünle, huylarınla, kısacası sen olduğun için seviyorum.",
  "",
  "Seninle daha yaşayacağımız çok şey, güleceğimiz çok anı, keşfedeceğimiz çok yer ve birbirimize anlatacağımız daha nice hikâyeler olsun istiyorum. Geleceği düşündüğümde, içinde senin de olduğun bir gelecek hayal etmek beni mutlu ediyor.",
  "",
  "Umarım yıllar sonra bugünleri hatırladığımızda birbirimize bakıp gülümseriz ve 'İyi ki o gün tanışmışız, iyi ki birbirimizi bırakmamışız.' deriz. ❤️",
  "",
  "İyi ki yollarımız kesişmiş, iyi ki seni tanımışım, iyi ki sevgilim olmuşsun. Hayatıma kattığın her şey için, bana yaşattığın güzel duygular için ve hayatımın bu iki yılını seninle paylaştığım için çok mutluyum.",
  "",
  "Belki sana her zaman anlatamıyorumdur ama benim için ne kadar özel olduğunu ve hayatımda olmanın benim için ne kadar anlamlı olduğunu bilmeni istiyorum.",
  "",
  "Seni ilk tanıdığım günkü heyecanla, bugün çok daha derin ve çok daha güzel bir sevgiyle seviyorum. İki yıl önce başlayan hikâyemizin daha nice yıllara uzanmasını, her yıl dönümümüzde birbirimizi daha iyi tanımamızı ve sevgimizin her geçen gün daha da büyümesini diliyorum.",
  "",
  "İkinci yıl dönümümüz kutlu olsun, aşkım. ❤️",
  "",
  "İyi ki sen, iyi ki biz… Seni bugün dünden daha çok, yarın ise bugünden daha çok sevmek dileğiyle. Nice güzel yıllarımıza, nice anılarımıza ve hep birlikte yazacağımız hikâyemize…",
  "",
  "Seni çok seviyorum, sevgilim. ❤️",
  "İyi ki hayatımdasın, iyi ki benimlesin. Seni hep böyle sevmek ve seninle daha nice yıl dönümlerini kutlamak istiyorum. 💞😚",
  "",
  "Sonsuza kadar bizim hikâyemiz… ❤️"
];

// split into real characters so emojis like ❤️ 😂 don't break while typing
const FULL = Array.from(LETTER.join("\n"));
const TYPE_SPEED = 25;  // ms per letter
const LINE_PAUSE = 400; // extra pause at the end of each line

export default function LetterPage({ onBack }) {
  const [count, setCount] = useState(0);
  const cursorRef = useRef(null);
  const done = count >= FULL.length;

  // type one more letter at a time
  useEffect(() => {
    if (done) return;
    const prev = FULL[count - 1];
    const delay =
      prev === "\n" ? LINE_PAUSE : /[.,!?…]/.test(prev) ? TYPE_SPEED * 5 : TYPE_SPEED;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [count, done]);

  // keep the typing visible: scroll down as the letter grows
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest" });
  }, [count]);

  return (
    <div style={styles.page} onClick={() => setCount(FULL.length)}>
      <style>{`
        @keyframes letterFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes letterBlink { 50% { opacity: 0 } }
      `}</style>

      <div style={styles.letter}>
        <p style={styles.text}>
          {FULL.slice(0, count).join("")}
          {!done && (
            <span ref={cursorRef} style={styles.cursor}>
              |
            </span>
          )}
        </p>
      </div>

      <button
        style={{ ...styles.back, opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
      >
        geri
      </button>
    </div>
  );
}

const styles = {
  page: {
    position: "fixed",
    inset: 0,
    overflowY: "auto",
    background: "#0b0b0b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 20px",
    boxSizing: "border-box",
    animation: "letterFade 1.2s ease",
    cursor: "default",
  },
  letter: {
    width: "100%",
    maxWidth: 640,
    minHeight: "50vh",
    flexShrink: 0, // let the box grow with the text instead of squeezing it
    marginTop: "auto", // centers vertically, but still scrolls if the letter is long
    padding: "clamp(24px, 6vw, 40px)",
    boxSizing: "border-box",
    borderRadius: 18,
    border: "1px solid rgba(87, 10, 10, 0.6)",
    background: "linear-gradient(180deg, rgba(87,10,10,0.18), rgba(87,10,10,0.06))",
  },
  text: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontFamily: '"Dancing Script", "Segoe Script", cursive',
    fontSize: "clamp(19px, 4.8vw, 25px)",
    lineHeight: 1.5,
    color: "#ead7d1",
  },
  cursor: {
    color: "#8a1c1c",
    animation: "letterBlink 1s steps(1) infinite",
  },
  back: {
    marginTop: 28,
    marginBottom: "auto",
    flexShrink: 0,
    padding: "10px 28px",
    borderRadius: 999,
    border: "none",
    background: "#570a0a",
    color: "#f3e6e1",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    fontSize: 15,
    letterSpacing: 0.5,
    cursor: "pointer",
    transition: "opacity 1s ease",
  },
};
