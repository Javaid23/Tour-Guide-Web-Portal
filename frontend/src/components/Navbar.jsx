import React, { useState, useCallback, memo, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import { Link, useLocation } from "react-router-dom"
import { Mountain, Menu, X } from "lucide-react"
import AuthModal from "./AuthModalNew"

/**
 * Navigation Component (JSX version)
 * Responsive navigation bar with Pakistan tour branding and menu items
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState("signin")
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation()

  // Get user from localStorage (simple auth placeholder)
  const user = JSON.parse(localStorage.getItem("user") || "null")
  const isAuthenticated = !!user

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: "Tours", path: "/tours" },
    { name: "Heritage", path: "/heritage" },
    { name: "Partners", path: "/partners" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  // Add Admin Panel link for admins only
  if (user && user.role === "admin") {
    navItems.push({ name: "Admin", path: "/admin" });
  }

  const isActive = useCallback((path) => location.pathname === path, [location.pathname])

  const openAuthModal = useCallback((mode) => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.reload()
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  // Close Auth Modal on route change
  React.useEffect(() => {
    setIsAuthModalOpen(false);
  }, [location.pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <>
      {/* Overlay for mobile menu, only when menu is open */}
      {isMenuOpen && <div className="navbar-menu-overlay active" onClick={() => setIsMenuOpen(false)}></div>}
      <nav className="navbar" style={{position: 'relative', zIndex: 2000}}>
        <div className="container" style={{ gap: '32px', justifyContent: 'space-between', paddingLeft: '0px', paddingRight: '40px', position: 'relative', zIndex: 2000, overflow: 'visible' }}>
          {/* Brand */}
          <Link to="/" className="navbar-brand" style={{ marginRight: '32px', minWidth: '180px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
              transition: 'all 0.3s ease',
              justifyContent: 'flex-start',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <Mountain size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  lineHeight: '1',
                  letterSpacing: '-0.5px'
                }}>
                  Tour Guide
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  opacity: '0.8',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  Pakistan
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation Links and Auth Buttons in a single flex row, justified and evenly spaced */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between', gap: '32px' }}>
            <ul className={`navbar-nav${isMenuOpen ? " active" : ""} navbar-nav-scroll`} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: '0', margin: 0, padding: 0, overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
              {navItems.map((item) => (
                <li key={item.name} style={{ display: 'inline-flex', alignItems: 'center', minWidth: '120px', marginRight: '8px' }}>
                  <Link
                    to={item.path}
                    className={isActive(item.path) ? "active" : ""}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px 0' }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4 min-w-[180px] justify-end flex-wrap md:flex-nowrap" style={{display: 'flex', alignItems: 'center', gap: '16px', minWidth: '180px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
              {isAuthenticated ? (
                <>
                  <div className="relative" ref={profileMenuRef} style={{zIndex: 99999}}>
                    <button
                      onClick={() => setIsProfileMenuOpen((v) => !v)}
                      className="modern-btn modern-btn-primary rounded-full px-5 py-2 text-base font-semibold shadow-md transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                      style={{background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white', border: 'none', minWidth: 120, textAlign: 'center', alignItems: 'center', display: 'flex'}}>
                      Profile
                    </button>
                    {isProfileMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-blue-100 animate-fade-in"
                        style={{
                          minWidth: '180px',
                          width: 'max-content',
                          maxWidth: '90vw',
                          boxSizing: 'border-box',
                          overflow: 'visible',
                          zIndex: 99999,
                          pointerEvents: 'auto',
                        }}
                      >
                        <Link
                          to="/profile"
                          className="block px-5 py-3 text-blue-700 hover:bg-blue-50 font-medium transition-colors rounded-t-xl"
                          style={{ width: '100%' }}
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 font-medium transition-colors rounded-b-xl border-t border-blue-100"
                          style={{ background: 'none', border: 'none', width: '100%' }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="modern-btn modern-btn-primary rounded-full px-6 py-2 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                    style={{ minWidth: 160, boxShadow: '0 4px 16px 0 rgba(59,130,246,0.10)' }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggle"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      )}
    </>
  )
}

export default memo(Navbar)
