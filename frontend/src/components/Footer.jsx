import React from 'react';
import { Mountain, Mail, Phone, MapPin, Facebook, Instagram, Heart, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Contains company information, contact details, and social media links
 */
const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)'
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px',
          padding: '80px 0 40px'
        }}>
          {/* Company Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '12px',
                marginRight: '16px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                <Mountain size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Tour Guide
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: '500',
                  letterSpacing: '1px'
                }}>
                  PAKISTAN
                </div>
              </div>
            </div>
            <p style={{
              color: '#cbd5e1',
              lineHeight: '1.7',
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Discover the breathtaking beauty of Pakistan with our expertly curated tour packages. 
              From the majestic peaks of the Himalayas to the rich cultural heritage of ancient cities.
            </p>
            
            {/* Social Media */}
            <div>
              <p style={{
                color: '#f1f5f9',
                fontWeight: '600',
                marginBottom: '16px',
                fontSize: '16px'
              }}>Follow Us</p>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                {[
                  { icon: Facebook, color: '#1877f2', url: 'https://web.facebook.com/profile.php?id=100066796029354' },
                  { icon: Instagram, color: '#e4405f', url: 'https://www.instagram.com/tourguide_pak?igsh=MXAxYXZzc3d2c2JtOQ==' }
                ].map(({ icon: Icon, color, url }, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    title="Follow us"
                    onMouseEnter={(e) => {
                      e.target.style.background = color
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = `0 8px 24px ${color}40`
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <Icon size={20} style={{ color: 'white' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f1f5f9',
              marginBottom: '24px',
              position: 'relative'
            }}>
              Quick Links
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '2px'
              }} />
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { name: 'Home', href: '/' },
                { name: 'Destinations', href: '/destinations' },
                { name: 'Tour Packages', href: '/tours' },
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: '#cbd5e1',
                    textDecoration: 'none',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    padding: '8px 0',
                    borderLeft: '3px solid transparent',
                    paddingLeft: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#60a5fa'
                    e.target.style.borderLeftColor = '#60a5fa'
                    e.target.style.paddingLeft = '20px'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#cbd5e1'
                    e.target.style.borderLeftColor = 'transparent'
                    e.target.style.paddingLeft = '12px'
                  }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f1f5f9',
              marginBottom: '24px',
              position: 'relative'
            }}>
              Contact Info
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '2px'
              }} />
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {[
                { icon: Phone, text: '+92 21 1234 5678', color: '#10b981' },
                { icon: Mail, text: 'info@tourguide.pk', color: '#3b82f6' }
              ].map(({ icon: Icon, text, color }, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    background: `${color}20`,
                    borderRadius: '10px',
                    border: `1px solid ${color}30`
                  }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <span style={{
                    color: '#cbd5e1',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '32px',
          paddingBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '16px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            © 2025 Tour Guide. All rights reserved.
          </p>
          
          {/* Development Tools - Commented out since connection-test was removed */}
          {/* 
          {process.env.NODE_ENV === 'development' && (
            <Link 
              to="/about"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#60a5fa',
                textDecoration: 'none',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <Wifi size={14} style={{ marginRight: '4px' }} />
              About
            </Link>
          )}
          */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
