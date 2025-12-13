/**
 * ============================================
 * SYNC PLANNER v4.2 - CONFIG MODULE
 * Konfigurasi dan Autentikasi
 * ============================================
 */

const SyncConfig = {
  // API Settings
  API_URL: localStorage.getItem('syncplanner_api_url') || '',
  CACHE_DURATION: 5 * 60 * 1000, // 5 menit
  API_TIMEOUT: 15000, // 15 detik
  
  // Google OAuth Client ID (ganti dengan client ID Anda)
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  
  // User data (akan diisi setelah login)
  user: null,
  
  // Initialize config
  init() {
    const savedUser = localStorage.getItem('syncplanner_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch(e) {
        this.user = null;
      }
    }
  },
  
  // Get user ID (untuk API calls)
  getUserId() {
    return this.user?.id || null;
  },
  
  // Check if logged in
  isLoggedIn() {
    return this.user !== null && this.user.id;
  },
  
  // Save user data
  setUser(userData) {
    this.user = userData;
    localStorage.setItem('syncplanner_user', JSON.stringify(userData));
  },
  
  // Clear user data (logout)
  clearUser() {
    this.user = null;
    localStorage.removeItem('syncplanner_user');
    localStorage.removeItem('syncplanner_api_url');
  },
  
  // Set API URL
  setApiUrl(url) {
    this.API_URL = url;
    localStorage.setItem('syncplanner_api_url', url);
  }
};

// Auth Module
const SyncAuth = {
  // Initialize Google Sign-In
  init() {
    // Load Google API jika belum
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initGoogleSignIn();
      document.head.appendChild(script);
    } else {
      this.initGoogleSignIn();
    }
  },
  
  // Setup Google Sign-In button
  initGoogleSignIn() {
    if (!window.google || !SyncConfig.GOOGLE_CLIENT_ID.includes('YOUR_')) {
      console.log('[Auth] Google Sign-In not configured, using demo mode');
      return;
    }
    
    google.accounts.id.initialize({
      client_id: SyncConfig.GOOGLE_CLIENT_ID,
      callback: this.handleGoogleSignIn.bind(this),
      auto_select: true
    });
    
    const buttonContainer = document.getElementById('googleSignInButton');
    if (buttonContainer) {
      google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 280
      });
    }
  },
  
  // Handle Google Sign-In response
  handleGoogleSignIn(response) {
    const payload = this.parseJwt(response.credential);
    
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      token: response.credential
    };
    
    SyncConfig.setUser(userData);
    this.onLoginSuccess(userData);
  },
  
  // Parse JWT token
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return {};
    }
  },
  
  // Demo login (untuk testing tanpa Google OAuth)
  demoLogin(name = 'Demo User') {
    const userData = {
      id: 'demo_' + Date.now(),
      email: 'demo@syncplanner.local',
      name: name,
      picture: null,
      isDemo: true
    };
    
    SyncConfig.setUser(userData);
    this.onLoginSuccess(userData);
  },
  
  // Logout
  logout() {
    if (window.google && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    SyncConfig.clearUser();
    this.onLogoutSuccess();
  },
  
  // Callbacks (akan di-override oleh app)
  onLoginSuccess(user) {
    console.log('[Auth] Login success:', user.name);
    // Override this in main app
  },
  
  onLogoutSuccess() {
    console.log('[Auth] Logout success');
    // Override this in main app
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyncConfig, SyncAuth };
}
