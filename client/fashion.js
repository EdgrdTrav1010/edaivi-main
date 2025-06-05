document.addEventListener('DOMContentLoaded', function() {
    // Get all sections and navigation links
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionLinks = document.querySelectorAll('[data-section]');
    
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
        }
    }
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            activateSection(sectionId);
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
    }
    
    // Shop filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const shopItems = document.querySelectorAll('.shop-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show/hide items based on filter
            shopItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Add smooth hover effects
    const collectionItems = document.querySelectorAll('.collection-item');
    const lookbookItems = document.querySelectorAll('.lookbook-item');
    
    // Function to add hover effect with slight delay
    function addHoverEffect(items) {
        items.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            item.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    this.style.zIndex = '1';
                }, 300);
            });
        });
    }
    
    addHoverEffect(collectionItems);
    addHoverEffect(lookbookItems);
    
    // Add parallax effect to hero section
    const heroSection = document.querySelector('.hero');
    const heroImage = document.querySelector('.image-container');
    
    if (heroSection && heroImage) {
        window.addEventListener('scroll', function() {
            // Only apply parallax if home section is active
            if (document.getElementById('home').classList.contains('active')) {
                const scrollPosition = window.scrollY;
                if (scrollPosition < window.innerHeight) {
                    heroImage.style.transform = `rotate(3deg) translateY(${scrollPosition * 0.1}px)`;
                }
            }
        });
    }
    
    // Add animation to section elements when they become visible
    function animateSectionElements() {
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            const elements = activeSection.querySelectorAll('.section-header, .collection-item, .trending-main, .trending-item, .lookbook-item, .shop-item');
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    }
    
    // Call animation function when section changes
    const observerConfig = { attributes: true, attributeFilter: ['class'] };
    
    sections.forEach(section => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && section.classList.contains('active')) {
                    animateSectionElements();
                }
            });
        });
        
        observer.observe(section, observerConfig);
    });
    
    // Initialize animations for the initially active section
    animateSectionElements();
    
    // Mobile menu toggle (for responsive design)
    const navContainer = document.querySelector('.nav-container');
    const navLinksContainer = document.querySelector('.nav-links');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.setAttribute('title', 'Меню');
    
    // Add mobile menu button to DOM for small screens
    function setupMobileMenu() {
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-btn')) {
                navContainer.insertBefore(mobileMenuBtn, navLinksContainer);
            }
            navLinksContainer.classList.add('mobile');
        } else {
            if (document.querySelector('.mobile-menu-btn')) {
                document.querySelector('.mobile-menu-btn').remove();
            }
            navLinksContainer.classList.remove('mobile');
            navLinksContainer.classList.remove('active');
        }
    }
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
        this.innerHTML = navLinksContainer.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Close mobile menu when a link is clicked
    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (navLinksContainer.classList.contains('mobile') && navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
    
    // Setup mobile menu on load and resize
    window.addEventListener('resize', setupMobileMenu);
    setupMobileMenu();
});
