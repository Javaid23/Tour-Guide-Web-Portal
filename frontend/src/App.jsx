import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense, lazy } from "react";
import AuthProvider from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load components for better performance
const Home = lazy(() => import("./pages/Home"));
const Destinations = lazy(() => import("./pages/Destinations"));
const TourDetails = lazy(() => import("./pages/TourDetails"));
const Tours = lazy(() => import("./pages/Tours"));
const Heritage = lazy(() => import("./pages/Heritage"));
const Partners = lazy(() => import("./pages/Partners"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const TourGuideDashboard = lazy(() => import("./pages/TourGuideDashboard"));
const DestinationDetails = lazy(() => import("./pages/DestinationDetails"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Profile = lazy(() => import("./pages/Profile"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RequireGuide = lazy(() => import("./components/RequireGuide"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Move stripePromise outside to avoid re-initialization
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51ReKnOPfe3xIaFnM632dYuyOrPh76zdLqkJveHqooj6Visy0Z9F74mtLWL95xgAn90flwsMbeJRQyWcmtEdz5pYv005pv8S7N3"
);

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "193682875788-m6hm75tt692g0t5p16391rkue1l4ekkn.apps.googleusercontent.com"}>
        <Elements stripe={stripePromise}>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/destinations" element={<Destinations />} />
                    <Route path="/destinations/:id" element={<DestinationDetails />} />
                    <Route path="/tours" element={<Tours />} />
                    <Route path="/tours/:id" element={<TourDetails />} />
                    <Route path="/heritage" element={<Heritage />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={
                      <Suspense fallback={<Loading />}>
                        <AdminPanel />
                      </Suspense>
                    } />
                    <Route path="/guide-dashboard" element={
                      <Suspense fallback={<Loading />}>
                        <RequireGuide><TourGuideDashboard /></RequireGuide>
                      </Suspense>
                    } />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </Elements>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
