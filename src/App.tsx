import { Routes, Route } from "react-router-dom"
import { Navbar } from "./components/navbar"
import { Footer } from "./components/footer"
import { FloatingWhatsApp } from "./components/floating-whatsapp"
import { Toaster } from "sonner"
import HomePage from "./pages/home"
import AboutPage from "./pages/about"
import PracticeAreasPage from "./pages/practice-areas"
import ContactPage from "./pages/contact"

function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[60px] md:pt-0">
        <Routes>
          <Route path="/" element={<HomePage lang="es" />} />
          <Route path="/en" element={<HomePage lang="en" />} />
          <Route path="/about" element={<AboutPage lang="es" />} />
          <Route path="/en/about" element={<AboutPage lang="en" />} />
          <Route path="/practice-areas" element={<PracticeAreasPage lang="es" />} />
          <Route path="/en/practice-areas" element={<PracticeAreasPage lang="en" />} />
          <Route path="/contact" element={<ContactPage lang="es" />} />
          <Route path="/en/contact" element={<ContactPage lang="en" />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Toaster position="top-center" />
    </>
  )
}

export default App

