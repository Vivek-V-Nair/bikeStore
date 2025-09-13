// Advanced Professional JavaScript Features
// Particle effects, drag-and-drop, 3D animations, and interactive components

class AdvancedFeaturesManager {
    constructor(options = {}) {
        this.options = {
            enableParticles: true,
            enableDragDrop: true,
            enable3DEffects: true,
            enableVirtualScrolling: true,
            enableRealTimeUpdates: true,
            enableGestures: true,
            particleCount: 50,
            animationSpeed: 1,
            ...options
        };
        
        this.particles = [];
        this.draggedElement = null;
        this.virtualScrollContainer = null;
        this.realTimeInterval = null;
        this.gestureStartPos = null;
        
        this.init();
    }
    
    init() {
        this.setupParticleSystem();
        this.setupDragAndDrop();
        this.setup3DEffects();
        this.setupVirtualScrolling();
        this.setupRealTimeUpdates();
        this.setupGestureControls();
        this.setupInteractiveComponents();
        this.setupAdvancedAnimations();
        this.bindEvents();
    }
    
    setupParticleSystem() {
        if (!this.options.enableParticles) return;
        
        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        particleContainer.id = 'particle-system';
        document.body.appendChild(particleContainer);
        
        // Generate particles
        for (let i = 0; i < this.options.particleCount; i++) {
            this.createParticle(particleContainer);
        }
        
        // Dynamic particle generation
        this.startParticleAnimation();
    }
    
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Bike-themed particles (professional geometric shapes)
        const bikeSymbols = ['●', '◆', '▲', '■', '◯', '◇', '△', '□'];
        const bikeColors = ['#dc2626', '#ea580c', '#1d4ed8', '#059669', '#f59e0b', '#9ca3af'];
        
        const isSymbolParticle = Math.random() > 0.7;
        const size = Math.random() * (isSymbolParticle ? 20 : 4) + (isSymbolParticle ? 15 : 2);
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + 10;
        const duration = Math.random() * 6 + 8;
        const delay = Math.random() * 3;
        
        if (isSymbolParticle) {
            // Create geometric symbol particle
            particle.textContent = bikeSymbols[Math.floor(Math.random() * bikeSymbols.length)];
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                font-size: ${size}px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: 0.6;
                filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.4));
                pointer-events: none;
                position: absolute;
                z-index: 1;
                color: ${bikeColors[Math.floor(Math.random() * bikeColors.length)]};
            `;
            
            // Add spinning animation for circular particles
            if (particle.textContent === '●' || particle.textContent === '◯') {
                particle.style.animation += ', wheelSpin 2s linear infinite';
            }
        } else {
            // Create colored geometric particle
            const color = bikeColors[Math.floor(Math.random() * bikeColors.length)];
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: 0.4;
                box-shadow: 0 0 8px ${color};
                pointer-events: none;
                position: absolute;
                z-index: 1;
            `;
        }
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + delay) * 1000);
        
        return particle;
    }
    
    startParticleAnimation() {
        setInterval(() => {
            const container = document.getElementById('particle-system');
            if (container && container.children.length < this.options.particleCount) {
                this.createParticle(container);
            }
        }, 200);
    }
    
    setupDragAndDrop() {
        if (!this.options.enableDragDrop) return;
        
        // Make cards draggable
        this.makeDraggable('.card', {
            helper: 'clone',
            opacity: 0.7,
            revert: 'invalid'
        });
        
        // Create drop zones
        this.createDropZones();
    }
    
    makeDraggable(selector, options = {}) {
        document.querySelectorAll(selector).forEach(element => {
            element.setAttribute('draggable', 'true');
            element.classList.add('draggable-item');
            
            element.addEventListener('dragstart', (e) => {
                this.draggedElement = element;
                element.style.opacity = options.opacity || '0.5';
                element.style.transform = 'rotate(5deg) scale(1.05)';
                
                // Create drag image
                const dragImage = element.cloneNode(true);
                dragImage.style.cssText = `
                    position: absolute;
                    top: -1000px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                `;
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 0, 0);
                
                setTimeout(() => document.body.removeChild(dragImage), 0);
            });
            
            element.addEventListener('dragend', (e) => {
                element.style.opacity = '1';
                element.style.transform = '';
                this.draggedElement = null;
            });
        });
    }
    
    createDropZones() {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <div class="drop-zone-content">
                <i class="fas fa-cloud-upload-alt drop-zone-icon"></i>
                <h4>Drop Zone</h4>
                <p>Drag items here to organize</p>
            </div>
        `;
        
        dropZone.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 250px;
            height: 150px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            display: none;
            align-items: center;
            justify-content: center;
            text-align: center;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        document.body.appendChild(dropZone);
        
        // Show drop zone when dragging
        document.addEventListener('dragstart', () => {
            dropZone.style.display = 'flex';
        });
        
        document.addEventListener('dragend', () => {
            dropZone.style.display = 'none';
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#00d4ff';
            dropZone.style.background = 'rgba(0, 212, 255, 0.2)';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(this.draggedElement, dropZone);
        });
    }
    
    handleDrop(element, dropZone) {
        if (!element) return;
        
        // Animate drop
        element.style.animation = 'dropAnimation 0.5s ease-out';
        
        // Show success notification
        if (window.notifications) {
            window.notifications.show('Item organized successfully!', 'success', {
                duration: 2000,
                sound: true
            });
        }
        
        // Reset drop zone
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
    }
    
    setup3DEffects() {
        if (!this.options.enable3DEffects) return;
        
        // Add 3D tilt effect to cards
        document.querySelectorAll('.card').forEach(card => {
            this.add3DTiltEffect(card);
        });
        
        // Add 3D hover effects to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            this.add3DButtonEffect(btn);
        });
    }
    
    add3DTiltEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);
            
            const rotateX = deltaY * -10; // Max 10 degrees
            const rotateY = deltaX * 10;
            
            element.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    }
    
    add3DButtonEffect(button) {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'perspective(1000px) translateZ(-5px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'perspective(1000px) translateZ(0) scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'perspective(1000px) translateZ(0) scale(1)';
        });
    }
    
    setupVirtualScrolling() {
        if (!this.options.enableVirtualScrolling) return;
        
        // Find large tables or lists
        const largeTables = document.querySelectorAll('table tbody');
        largeTables.forEach(tbody => {
            if (tbody.children.length > 20) {
                this.enableVirtualScrolling(tbody);
            }
        });
    }
    
    enableVirtualScrolling(container) {
        const rows = Array.from(container.children);
        const rowHeight = 60; // Estimated row height
        const visibleRows = Math.ceil(window.innerHeight / rowHeight) + 5;
        
        let scrollTop = 0;
        let startIndex = 0;
        
        const scrollContainer = document.createElement('div');
        scrollContainer.style.cssText = `
            height: ${Math.min(visibleRows * rowHeight, 400)}px;
            overflow-y: auto;
            position: relative;
        `;
        
        const virtualContainer = document.createElement('div');
        virtualContainer.style.height = `${rows.length * rowHeight}px`;
        
        const visibleContainer = document.createElement('div');
        visibleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        `;
        
        virtualContainer.appendChild(visibleContainer);
        scrollContainer.appendChild(virtualContainer);
        
        container.parentNode.replaceChild(scrollContainer, container);
        
        const updateVisibleRows = () => {
            startIndex = Math.floor(scrollTop / rowHeight);
            const endIndex = Math.min(startIndex + visibleRows, rows.length);
            
            visibleContainer.innerHTML = '';
            visibleContainer.style.transform = `translateY(${startIndex * rowHeight}px)`;
            
            for (let i = startIndex; i < endIndex; i++) {
                if (rows[i]) {
                    visibleContainer.appendChild(rows[i].cloneNode(true));
                }
            }
        };
        
        scrollContainer.addEventListener('scroll', () => {
            scrollTop = scrollContainer.scrollTop;
            updateVisibleRows();
        });
        
        updateVisibleRows();
    }
    
    setupRealTimeUpdates() {
        if (!this.options.enableRealTimeUpdates) return;
        
        // Simulate real-time data updates
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 5000);
    }
    
    updateRealTimeData() {
        // Update statistics with animation
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const currentValue = parseInt(stat.textContent) || 0;
            const newValue = currentValue + Math.floor(Math.random() * 10);
            this.animateNumber(stat, currentValue, newValue);
        });
        
        // Update progress bars
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const newWidth = Math.random() * 100;
            bar.style.width = `${newWidth}%`;
        });
        
        // Show real-time notification
        if (window.notifications && Math.random() > 0.7) {
            const messages = [
                'New sale recorded!',
                'Inventory updated',
                'Customer registered',
                'Report generated'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            window.notifications.show(randomMessage, 'info', { duration: 2000 });
        }
    }
    
    animateNumber(element, from, to) {
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(from + (to - from) * this.easeOutCubic(progress));
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    setupGestureControls() {
        if (!this.options.enableGestures) return;
        
        // Touch gesture support
        document.addEventListener('touchstart', (e) => {
            this.gestureStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: Date.now()
            };
        });
        
        document.addEventListener('touchend', (e) => {
            if (!this.gestureStartPos) return;
            
            const endPos = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
                time: Date.now()
            };
            
            this.handleGesture(this.gestureStartPos, endPos);
            this.gestureStartPos = null;
        });
        
        // Mouse gesture support
        let mouseStartPos = null;
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                mouseStartPos = { x: e.clientX, y: e.clientY, time: Date.now() };
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (mouseStartPos && e.button === 2) {
                const endPos = { x: e.clientX, y: e.clientY, time: Date.now() };
                this.handleGesture(mouseStartPos, endPos);
                mouseStartPos = null;
            }
        });
    }
    
    handleGesture(startPos, endPos) {
        const deltaX = endPos.x - startPos.x;
        const deltaY = endPos.y - startPos.y;
        const deltaTime = endPos.time - startPos.time;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only handle quick gestures
        if (deltaTime > 500 || distance < 50) return;
        
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Determine gesture direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.handleSwipeRight();
            } else {
                this.handleSwipeLeft();
            }
        } else {
            if (deltaY > 0) {
                this.handleSwipeDown();
            } else {
                this.handleSwipeUp();
            }
        }
    }
    
    handleSwipeRight() {
        // Navigate forward
        if (window.history.length > 1) {
            window.history.forward();
        }
        this.showGestureIndicator('→', 'Next');
    }
    
    handleSwipeLeft() {
        // Navigate back
        window.history.back();
        this.showGestureIndicator('←', 'Back');
    }
    
    handleSwipeUp() {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showGestureIndicator('↑', 'Top');
    }
    
    handleSwipeDown() {
        // Show/hide navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.transform = navbar.style.transform === 'translateY(-100%)' 
                ? 'translateY(0)' 
                : 'translateY(-100%)';
        }
        this.showGestureIndicator('↓', 'Menu');
    }
    
    showGestureIndicator(symbol, action) {
        const indicator = document.createElement('div');
        indicator.className = 'gesture-indicator';
        indicator.innerHTML = `
            <div class="gesture-symbol">${symbol}</div>
            <div class="gesture-action">${action}</div>
        `;
        
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 16px;
            text-align: center;
            z-index: 9999;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: gestureIndicator 0.8s ease-out;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 800);
    }
    
    setupInteractiveComponents() {
        this.createFloatingActionButton();
        this.createMiniPlayer();
        this.createQuickActions();
        this.createAdvancedSearch();
    }
    
    createFloatingActionButton() {
        const fab = document.createElement('div');
        fab.className = 'floating-action-button bike-fab';
        fab.innerHTML = `
            <div class="fab-main bike-main">
                <i class="fas fa-bicycle"></i>
            </div>
            <div class="fab-menu bike-menu">
                <div class="fab-item bike-item" data-action="add-bike">
                    <i class="fas fa-bicycle"></i>
                    <span>Add Bike</span>
                </div>
                <div class="fab-item bike-item" data-action="add-customer">
                    <i class="fas fa-user-plus"></i>
                    <span>Add Customer</span>
                </div>
                <div class="fab-item bike-item" data-action="new-sale">
                    <i class="fas fa-shopping-cart"></i>
                    <span>New Sale</span>
                </div>
                <div class="fab-item bike-item" data-action="inventory">
                    <i class="fas fa-boxes"></i>
                    <span>Inventory</span>
                </div>
            </div>
        `;
        
        fab.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
        `;
        
        document.body.appendChild(fab);
        
        // Add bike-themed FAB styling
        const style = document.createElement('style');
        style.textContent = `
            .bike-fab .fab-main {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
                animation: wheelSpin 3s linear infinite;
            }
            
            .bike-fab .fab-main:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(220, 38, 38, 0.6);
                animation-duration: 1s;
            }
            
            .bike-fab .fab-menu {
                position: absolute;
                bottom: 70px;
                right: 0;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .bike-fab.active .fab-menu {
                opacity: 1;
                visibility: visible;
            }
            
            .bike-fab .fab-item {
                display: flex;
                align-items: center;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                margin-bottom: 10px;
                padding: 12px 16px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);
                border: 1px solid rgba(220, 38, 38, 0.3);
                min-width: 140px;
            }
            
            .bike-fab .fab-item:hover {
                background: linear-gradient(135deg, #334155 0%, #475569 100%);
                transform: translateX(-5px);
                box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
            }
            
            .bike-fab .fab-item span {
                margin-left: 8px;
                color: white;
                font-weight: 500;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
        
        // FAB interactions
        const fabMain = fab.querySelector('.fab-main');
        const fabMenu = fab.querySelector('.fab-menu');
        
        fabMain.addEventListener('click', () => {
            fab.classList.toggle('active');
        });
        
        // Handle FAB actions with bike store specific actions
        fab.addEventListener('click', (e) => {
            const action = e.target.closest('.fab-item')?.dataset.action;
            if (action) {
                this.handleFabAction(action);
            }
        });
    }
    
    handleFabAction(action) {
        const actions = {
            'add-bike': () => window.location.href = '/bikes/create/',
            'add-customer': () => window.location.href = '/customers/create/',
            'new-sale': () => window.location.href = '/sales/create/'
        };
        
        if (actions[action]) {
            actions[action]();
        }
    }
    
    createMiniPlayer() {
        // Ambient sound player for better UX
        const miniPlayer = document.createElement('div');
        miniPlayer.className = 'mini-player';
        miniPlayer.innerHTML = `
            <div class="mini-player-content">
                <div class="mini-player-controls">
                    <button class="mini-player-btn" id="ambient-toggle">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <span class="mini-player-text">Ambient</span>
                </div>
            </div>
        `;
        
        miniPlayer.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 50px;
            padding: 10px 20px;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(miniPlayer);
        
        // Ambient sound control
        document.getElementById('ambient-toggle').addEventListener('click', () => {
            this.toggleAmbientSound();
        });
    }
    
    toggleAmbientSound() {
        // Toggle ambient sound (would integrate with Web Audio API)
        const isPlaying = localStorage.getItem('ambientPlaying') === 'true';
        localStorage.setItem('ambientPlaying', !isPlaying);
        
        const icon = document.querySelector('#ambient-toggle i');
        icon.className = isPlaying ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        
        if (window.notifications) {
            window.notifications.show(
                isPlaying ? 'Ambient sound disabled' : 'Ambient sound enabled',
                'info',
                { duration: 1500 }
            );
        }
    }
    
    createQuickActions() {
        // Quick action shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'B':
                        e.preventDefault();
                        window.location.href = '/bikes/create/';
                        break;
                    case 'C':
                        e.preventDefault();
                        window.location.href = '/customers/create/';
                        break;
                    case 'S':
                        e.preventDefault();
                        window.location.href = '/sales/create/';
                        break;
                    case 'D':
                        e.preventDefault();
                        window.location.href = '/dashboard/';
                        break;
                }
            }
        });
    }
    
    createAdvancedSearch() {
        // Enhanced search with autocomplete and filters
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            this.enhanceSearchInput(input);
        });
    }
    
    enhanceSearchInput(input) {
        // Add search enhancements
        const wrapper = document.createElement('div');
        wrapper.className = 'advanced-search-wrapper';
        wrapper.style.position = 'relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Add search filters
        const filterBtn = document.createElement('button');
        filterBtn.className = 'btn btn-outline-secondary btn-sm search-filter-btn';
        filterBtn.innerHTML = '<i class="fas fa-filter"></i>';
        filterBtn.style.cssText = `
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
        `;
        
        wrapper.appendChild(filterBtn);
        
        filterBtn.addEventListener('click', () => {
            this.showSearchFilters(input);
        });
    }
    
    showSearchFilters(input) {
        // Create search filter modal
        const modal = document.createElement('div');
        modal.className = 'search-filter-modal';
        modal.innerHTML = `
            <div class="search-filter-content">
                <h5>Search Filters</h5>
                <div class="filter-group">
                    <label>Category:</label>
                    <select class="form-control">
                        <option value="">All</option>
                        <option value="bikes">Bikes</option>
                        <option value="customers">Customers</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Date Range:</label>
                    <input type="date" class="form-control">
                    <input type="date" class="form-control">
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary">Apply</button>
                    <button class="btn btn-secondary">Clear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Position modal near input
        const rect = input.getBoundingClientRect();
        modal.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            left: ${rect.left}px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        
        // Close modal when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeModal(e) {
                if (!modal.contains(e.target)) {
                    modal.remove();
                    document.removeEventListener('click', closeModal);
                }
            });
        }, 100);
    }
    
    setupAdvancedAnimations() {
        // Add CSS for advanced animations
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes dropAnimation {
                0% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.1) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            @keyframes gestureIndicator {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
            
            .floating-action-button {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .floating-action-button .fab-main {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .floating-action-button .fab-main:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
            }
            
            .floating-action-button .fab-menu {
                position: absolute;
                bottom: 70px;
                right: 0;
                display: flex;
                flex-direction: column;
                gap: 10px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .floating-action-button.active .fab-menu {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .floating-action-button .fab-item {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                padding: 12px 16px;
                border-radius: 25px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .floating-action-button .fab-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateX(-5px);
            }
            
            .mini-player:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            .draggable-item {
                cursor: grab;
                transition: all 0.3s ease;
            }
            
            .draggable-item:active {
                cursor: grabbing;
            }
            
            .drop-zone {
                border-style: dashed !important;
                border-width: 2px !important;
            }
            
            .search-filter-modal {
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .gesture-symbol {
                font-size: 2rem;
                margin-bottom: 5px;
            }
            
            .gesture-action {
                font-size: 0.875rem;
                opacity: 0.8;
            }
        `;
        
        document.head.appendChild(styleSheet);
    }
    
    bindEvents() {
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }
    
    handleResize() {
        // Recalculate particle positions
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            if (parseInt(particle.style.left) > window.innerWidth) {
                particle.style.left = Math.random() * window.innerWidth + 'px';
            }
        });
    }
    
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
    }
    
    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
        if (this.options.enableRealTimeUpdates) {
            this.setupRealTimeUpdates();
        }
    }
    
    setupPerformanceMonitoring() {
        // Monitor performance and adjust features accordingly
        let frameCount = 0;
        let lastTime = Date.now();
        
        const checkPerformance = () => {
            frameCount++;
            const currentTime = Date.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust features based on performance
                if (fps < 30) {
                    this.options.particleCount = Math.max(10, this.options.particleCount - 5);
                    this.options.animationSpeed = 0.5;
                } else if (fps > 50) {
                    this.options.particleCount = Math.min(100, this.options.particleCount + 2);
                    this.options.animationSpeed = 1;
                }
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        checkPerformance();
    }
    
    // Public API methods
    enableFeature(feature) {
        this.options[feature] = true;
        this.reinitializeFeature(feature);
    }
    
    disableFeature(feature) {
        this.options[feature] = false;
    }
    
    reinitializeFeature(feature) {
        const featureMap = {
            enableParticles: () => this.setupParticleSystem(),
            enableDragDrop: () => this.setupDragAndDrop(),
            enable3DEffects: () => this.setup3DEffects(),
            enableVirtualScrolling: () => this.setupVirtualScrolling(),
            enableRealTimeUpdates: () => this.setupRealTimeUpdates(),
            enableGestures: () => this.setupGestureControls()
        };
        
        if (featureMap[feature]) {
            featureMap[feature]();
        }
    }
    
    destroy() {
        // Cleanup
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        const particleContainer = document.getElementById('particle-system');
        if (particleContainer) {
            particleContainer.remove();
        }
        
        document.removeEventListener('dragstart', this.handleDragStart);
        document.removeEventListener('dragend', this.handleDragEnd);
    }
}

// Initialize advanced features
let advancedFeatures;

document.addEventListener('DOMContentLoaded', () => {
    advancedFeatures = new AdvancedFeaturesManager({
        enableParticles: true,
        enableDragDrop: true,
        enable3DEffects: true,
        enableVirtualScrolling: true,
        enableRealTimeUpdates: true,
        enableGestures: true,
        particleCount: 30 // Reduced for better performance
    });
    
    // Make globally available
    window.advancedFeatures = advancedFeatures;
    
    console.log('🌟 Advanced Professional Features Loaded:');
    console.log('✨ Particle system with floating animations');
    console.log('🎯 Drag & drop functionality');
    console.log('🎭 3D tilt and hover effects');
    console.log('📜 Virtual scrolling for large data sets');
    console.log('⚡ Real-time data updates');
    console.log('👆 Touch and mouse gestures');
    console.log('🚀 Floating action button');
    console.log('🎵 Ambient sound controls');
    console.log('🔍 Advanced search with filters');
});

// Export for module use
window.AdvancedFeaturesManager = AdvancedFeaturesManager;