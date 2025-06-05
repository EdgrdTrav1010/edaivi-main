document.addEventListener('DOMContentLoaded', function() {
    // Get all sections and navigation links
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionLinks = document.querySelectorAll('[data-section]');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    // Function to activate a section
    function activateSection(sectionId) {
        // Hide all sections first
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Activate the selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Add active class to the corresponding nav link
            const activeNavLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
            if (activeNavLink) {
                activeNavLink.classList.add('active');
            }
            
            // Update URL hash without scrolling
            history.pushState(null, null, `#${sectionId}`);
            
            // Animate elements in the active section
            animateSectionElements(targetSection);
        }
    }
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            activateSection(sectionId);
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    });
    
    // Handle other section links (like buttons that navigate to sections)
    sectionLinks.forEach(link => {
        if (!link.classList.contains('nav-link')) { // Skip nav links as they're already handled
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                activateSection(sectionId);
            });
        }
    });
    
    // Handle URL hash changes
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1);
        if (sectionId) {
            activateSection(sectionId);
        }
    });
    
    // Check URL hash on page load
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        activateSection(sectionId);
    } else {
        // Activate home section by default
        activateSection('home');
    }
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.innerHTML = nav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Function to animate elements when a section becomes active
    function animateSectionElements(section) {
        // Reset animations
        const animatedElements = section.querySelectorAll('.feature-card, .model-card, .api-info, .api-example, .contact-form, .contact-info');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = element.classList.contains('api-info') ? 'translateX(-20px)' : 
                                     element.classList.contains('api-example') ? 'translateX(20px)' : 'translateY(20px)';
        });
        
        // Trigger animations with slight delay
        setTimeout(() => {
            animatedElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translate(0)';
                }, index * 100);
            });
        }, 300);
    }
    
    // Modal functionality
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const devLoginModal = document.getElementById('dev-login-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // Show modals
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerModal.style.display = 'flex';
        });
    }
    
    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'none';
            if (devLoginModal) devLoginModal.style.display = 'none';
        });
    });
    
    // Switch between modals
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (loginModal && e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (registerModal && e.target === registerModal) {
            registerModal.style.display = 'none';
        }
        if (devLoginModal && e.target === devLoginModal) {
            devLoginModal.style.display = 'none';
        }
    });
    
    // Developer login functionality (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D' && devLoginModal) {
            devLoginModal.style.display = 'flex';
            e.preventDefault();
        }
    });
    
    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const devLoginForm = document.getElementById('dev-login-form');
    const contactForm = document.getElementById('contact-form');
    
    // API URL
    const API_URL = 'http://localhost:3001/api';
    
    // Auth token
    let authToken = localStorage.getItem('authToken');
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token
                    localStorage.setItem('authToken', data.token);
                    authToken = data.token;
                    
                    // Close modal
                    loginModal.style.display = 'none';
                    
                    // Update UI
                    updateAuthUI(data.user);
                    
                    // Show success message
                    alert('Вход выполнен успешно!');
                } else {
                    alert(`Ошибка: ${data.message}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Произошла ошибка при входе. Пожалуйста, попробуйте снова.');
            }
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const displayName = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            
            // Validate passwords match
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ displayName, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token
                    localStorage.setItem('authToken', data.token);
                    authToken = data.token;
                    
                    // Close modal
                    registerModal.style.display = 'none';
                    
                    // Update UI
                    updateAuthUI(data.user);
                    
                    // Show success message
                    alert('Регистрация выполнена успешно!');
                } else {
                    alert(`Ошибка: ${data.message}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
            }
        });
    }
    
    // Developer login form submission
    if (devLoginForm) {
        devLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('dev-login-email').value;
            const password = document.getElementById('dev-login-password').value;
            const devKey = document.getElementById('dev-key').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/dev-login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, devKey })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token and developer flag
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('isDeveloper', 'true');
                    authToken = data.token;
                    
                    // Close modal
                    devLoginModal.style.display = 'none';
                    
                    // Update UI with developer indicator
                    updateAuthUI(data.user);
                    
                    // Show success message
                    alert('Вход разработчика выполнен успешно!');
                } else {
                    alert(`Ошибка: ${data.message}`);
                }
            } catch (error) {
                console.error('Developer login error:', error);
                alert('Произошла ошибка при входе. Пожалуйста, попробуйте снова.');
            }
        });
    }
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // In a real application, you would send this data to your server
            console.log('Contact form submitted:', { name, email, message });
            
            // Show success message
            alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Update UI based on authentication status
    function updateAuthUI(user) {
        const authButtons = document.querySelector('.auth-buttons');
        
        if (!authButtons) return;
        
        if (user) {
            // User is logged in
            const isDeveloper = user.isDeveloper || localStorage.getItem('isDeveloper') === 'true';
            
            authButtons.innerHTML = `
                <div class="user-info">
                    <span>Привет, ${user.displayName}${isDeveloper ? ' <strong style="color:#ff5722;">[Разработчик]</strong>' : ''}</span>
                    <button id="logout-btn" class="btn btn-outline">Выйти</button>
                </div>
            `;
            
            // Add logout functionality
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('isDeveloper');
                authToken = null;
                updateAuthUI(null);
                alert('Вы вышли из системы');
            });
        } else {
            // User is not logged in
            authButtons.innerHTML = `
                <button id="login-btn" class="btn btn-outline">Войти</button>
                <button id="register-btn" class="btn btn-primary">Регистрация</button>
            `;
            
            // Re-add event listeners
            document.getElementById('login-btn').addEventListener('click', () => {
                loginModal.style.display = 'flex';
            });
            
            document.getElementById('register-btn').addEventListener('click', () => {
                registerModal.style.display = 'flex';
            });
        }
    }
    
    // Check if user is already logged in
    async function checkAuth() {
        if (authToken) {
            try {
                const response = await fetch(`${API_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    updateAuthUI(user);
                } else {
                    // Token is invalid or expired
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('isDeveloper');
                    authToken = null;
                }
            } catch (error) {
                console.error('Auth check error:', error);
            }
        }
    }
    
    // Check auth status on page load
    checkAuth();
    
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                activateSection(targetId);
            }
        });
    });
});
