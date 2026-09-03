import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Analytics } from "@vercel/analytics/react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Collections from "./pages/Collections"
import RentBuy from "./pages/RentBuy"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Admin from "./pages/Admin"
import { AuthProvider } from "./context/AuthContext"
import { ProductProvider } from "./context/ProductContext"
import { AnalyticsProvider, useAnalytics } from "./context/AnalyticsContext"

function RouteTracker() {
  const { pathname } = useLocation()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    window.scrollTo(0, 0)
    trackPageView(pathname)
  }, [pathname, trackPageView])

  return null
}

function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <div className="min-h-screen flex flex-col">
      <RouteTracker />
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/rent-buy" element={<RentBuy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AnalyticsProvider>
          <BrowserRouter>
            <Layout />
            <Analytics />
          </BrowserRouter>
        </AnalyticsProvider>
      </ProductProvider>
    </AuthProvider>
  )
}
