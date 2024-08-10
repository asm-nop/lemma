import Header from "./components/Header.tsx";
import TheoremList from "./components/TheoremList.tsx";
import Footer from "./components/Footer.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TheoremDetail from "./components/TheoremDetail.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TheoremList />} />
            <Route path="/theorem/:slug" element={<TheoremDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
