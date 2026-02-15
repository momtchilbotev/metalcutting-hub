import './router.js';
import { initializeApp } from './config.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Toast } from './components/Toast.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize app configuration
    await initializeApp();

    // Initialize shared components
    const navbar = new Navbar('navbar-container');
    const footer = new Footer('footer-container');

    // Render navbar and footer
    await navbar.render();
    await footer.render();

    // Initialize router and load initial route
    window.router.init();

    // Set up global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });

    // Set up unhandled rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });

    console.log('Metalcutting Hub initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    document.getElementById('app-container').innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger">
          <h4 class="alert-heading">Грешка при зареждане</h4>
          <p>Възникна грешка при инициализиране на приложението.</p>
        </div>
      </div>
    `;
  }
});

// Expose Toast globally for easy access
window.showToast = (message, type = 'info') => {
  Toast.show(message, type);
};
