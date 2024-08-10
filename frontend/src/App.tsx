import Header from "./components/Header.tsx";
import TheoremList from "./components/TheoremList.tsx";
import Footer from "./components/Footer.tsx";
import './index.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Math Competition Platform
        </h1>
        <TheoremList />
      </main>
      <Footer />
    </div>
  );
}

export default App;
