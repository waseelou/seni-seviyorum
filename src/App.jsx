import { useState } from "react";
import HeartPage from "./HeartPage";
import LetterPage from "./LetterPage";

export default function App() {
  const [page, setPage] = useState("heart");

  if (page === "heart") {
    return <HeartPage onNext={() => setPage("letter")} />;
  }
  return <LetterPage onBack={() => setPage("heart")} />;
}
