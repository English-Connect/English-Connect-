import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                
                {/* Sección 1: Logo e información */}
                <div className="footer-section">
                    <h3 className="footer-title">ENGLISH CONNECT</h3>
                    <p className="footer-description">
                        Plataforma interactiva para aprender inglés de manera efectiva 
                        y conectarte con hablantes nativos.
                    </p>
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} English Connect. Todos los derechos reservados.
                    </p>
                </div>
                
                {/* Sección 2: Enlaces rápidos */}
                <div className="footer-section">
                    <h4 className="footer-subtitle">Enlaces Rápidos</h4>
                    <ul className="footer-links">
                        <li><a href="/about">Acerca de Nosotros</a></li>
                        <li><a href="/courses">Cursos</a></li>
                        <li><a href="/pricing">Precios</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/careers">Carreras</a></li>
                    </ul>
                </div>
                
                {/* Sección 3: Soporte y Contacto */}
                <div className="footer-section">
                    <h4 className="footer-subtitle">Soporte</h4>
                    <ul className="footer-links">
                        <li><a href="/faq">Preguntas Frecuentes</a></li>
                        <li><a href="/contact">Contacto</a></li>
                        <li><a href="/support">Soporte Técnico</a></li>
                        <li><a href="/privacy">Política de Privacidad</a></li>
                        <li><a href="/terms">Términos de Servicio</a></li>
                    </ul>
                </div>
                
                {/* Sección 4: Información de contacto */}
                <div className="footer-section">
                    <h4 className="footer-subtitle">Contacto</h4>
                    <div className="contact-info">
                        <p className="contact-item">
                            <span className="contact-icon">📧</span>
                            soporte@englishconnect.com
                        </p>
                        <p className="contact-item">
                            <span className="contact-icon">📞</span>
                            +1 (123) 456-7890
                        </p>
                        <p className="contact-item">
                            <span className="contact-icon">📍</span>
                            123 Calle Inglés, Ciudad, País
                        </p>
                        <p className="contact-item">
                            <span className="contact-icon">🕒</span>
                            Lunes a Viernes: 9am - 6pm
                        </p>
                    </div>
                    
                    {/* Redes Sociales */}
                    <div className="social-media">
                        <h4 className="footer-subtitle">Síguenos</h4>
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                Facebook
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                Twitter
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                Instagram
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>
                
            </div>
            
            {/* Línea divisoria y mensaje final */}
            <div className="footer-bottom">
                <p>English Connect - Aprende inglés de forma interactiva y divertida</p>
            </div>
        </footer>
    );
};

export default Footer;