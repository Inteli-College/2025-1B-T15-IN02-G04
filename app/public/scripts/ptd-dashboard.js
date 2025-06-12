// PTD Dashboard JavaScript
let currentUser = null;
let userProgress = [];
let userTrails = [];
let currentCourse = null;

// Initialize PTD dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) {
        return;
    }
    
    loadUserData();
    loadPTDDashboard();
});

// Load user data and check PTD role
async function loadUserData() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            currentUser = JSON.parse(userData);
            
            // Verify PTD role
            const response = await authenticatedRequest(`/api/user-roles/profile/${currentUser.id}`);
            if (response.ok) {
                const profile = await response.json();
                if (!profile.roles.includes('PTD')) {
                    showMessage('Acesso negado. Esta página é apenas para PTDs.', 'error');
                    window.location.href = '/dashboard';
                    return;
                }
                
                updateWelcomeMessage(profile);
                loadPTDProgress(profile);
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Erro ao carregar dados do usuário.', 'error');
    }
}

// Update welcome message with user name
function updateWelcomeMessage(profile) {
    const welcomeElement = document.getElementById('welcome-message');
    const userNameElement = document.getElementById('user-name');
    
    if (profile.first_name) {
        userNameElement.textContent = profile.first_name;
    }
}

// Load PTD dashboard data
async function loadPTDDashboard() {
    try {
        const response = await authenticatedRequest(`/api/user-roles/dashboard/${currentUser.id}`);
        if (response.ok) {
            const dashboardData = await response.json();
            
            if (dashboardData.ptd) {
                updatePTDStats(dashboardData.ptd.stats);
                loadRecentTrails(dashboardData.ptd.recentTrails);
            }
        }
    } catch (error) {
        console.error('Error loading PTD dashboard:', error);
    }
}

// Update PTD statistics
function updatePTDStats(stats) {
    document.getElementById('completed-trails').textContent = stats.completed_trails || 0;
    document.getElementById('in-progress-trails').textContent = stats.in_progress_trails || 0;
    document.getElementById('avg-progress').textContent = Math.round(stats.avg_progress || 0) + '%';
    
    // Calculate points based on progress
    const totalPoints = (stats.completed_trails * 100) + (stats.in_progress_trails * 25);
    document.getElementById('total-points').textContent = totalPoints;
}

// Load PTD progress data
function loadPTDProgress(profile) {
    if (profile.progress && profile.progress.length > 0) {
        userProgress = profile.progress;
        renderProgressTabs();
        document.getElementById('current-progress-section').style.display = 'block';
    }
}

// Load recent trails
function loadRecentTrails(recentTrails) {
    if (recentTrails && recentTrails.length > 0) {
        renderProgressGrid(recentTrails, 'progress-grid');
    }
}

// Render progress tabs content
function renderProgressTabs() {
    const inProgress = userProgress.filter(p => p.progress > 0 && p.progress < 100);
    const completed = userProgress.filter(p => p.progress === 100);
    const inList = userProgress.filter(p => p.progress === 0);
    
    renderProgressGrid(inProgress, 'progress-grid');
    renderProgressGrid(inList, 'lista-grid');
    renderProgressGrid(completed, 'concluidos-grid');
}

// Render progress grid
function renderProgressGrid(items, containerId) {
    const container = document.getElementById(containerId);
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum item encontrado.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="progress-card" onclick="openCourseDetails(${item.trail_id || item.id})">
            <div class="progress-header">
                <div class="progress-title">${item.trail_name || item.name}</div>
                <div class="progress-percentage">${item.progress || 0}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
            </div>
            <div class="progress-description">${item.description || 'Descrição não disponível'}</div>
            <button class="continue-btn" onclick="continueCourse(${item.trail_id || item.id}); event.stopPropagation();">
                ${item.progress === 100 ? 'Revisitar' : item.progress > 0 ? 'Continuar' : 'Iniciar'}
            </button>
        </div>
    `).join('');
}

// PTD Menu Functions
function openProfile() {
    showMessage('Funcionalidade de perfil será implementada em breve!', 'info');
}

function openTalhao() {
    const modal = document.getElementById('talhao-modal');
    loadTalhaoData();
    modal.style.display = 'block';
}

function openProgressoCurso() {
    showProgressTab('andamento');
    document.getElementById('current-progress-section').scrollIntoView({ behavior: 'smooth' });
}

function openRanking() {
    const modal = document.getElementById('ranking-modal');
    loadRankingData();
    modal.style.display = 'block';
}

function openAtendimento() {
    showMessage('Sistema de atendimento em desenvolvimento. Entre em contato pelo email suporte@aprendizagro.com', 'info');
}

function openCalendario() {
    showMessage('Calendário será implementado em breve!', 'info');
}

function openBancoCursos() {
    window.location.href = '/dashboard';
}

function openComunidade() {
    showMessage('Comunidade será implementada em breve!', 'info');
}

function openProvasTestes() {
    showMessage('Sistema de provas e testes será implementado em breve!', 'info');
}

function openInsignias() {
    showMessage('Sistema de insígnias e medalhas será implementado em breve!', 'info');
}

// Progress tabs functionality
function showProgressTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Course details functionality
function openCourseDetails(courseId) {
    currentCourse = { id: courseId };
    const modal = document.getElementById('course-modal');
    
    // Load course details
    loadCourseData(courseId);
    modal.style.display = 'block';
}

function closeCourseModal() {
    document.getElementById('course-modal').style.display = 'none';
    currentCourse = null;
}

function continueCourse(courseId) {
    openCourseDetails(courseId);
}

// Load course data
async function loadCourseData(courseId) {
    try {
        const response = await authenticatedRequest(`/api/trails/${courseId}`);
        if (response.ok) {
            const course = await response.json();
            
            document.getElementById('modal-course-title').textContent = course.name;
            
            // Update progress
            const userCourse = userProgress.find(p => p.trail_id === courseId);
            const progress = userCourse ? userCourse.progress : 0;
            
            document.getElementById('course-progress-fill').style.width = progress + '%';
            document.getElementById('course-progress-text').textContent = progress + '%';
            
            // Show appropriate buttons
            if (progress === 100) {
                document.getElementById('get-certificate-btn').style.display = 'inline-block';
                document.getElementById('take-test-btn').style.display = 'none';
            } else if (progress >= 80) {
                document.getElementById('take-test-btn').style.display = 'inline-block';
                document.getElementById('get-certificate-btn').style.display = 'none';
            }
            
            loadCourseModules(courseId);
        }
    } catch (error) {
        console.error('Error loading course data:', error);
        showMessage('Erro ao carregar dados do curso.', 'error');
    }
}

// Load course modules
async function loadCourseModules(courseId) {
    try {
        const response = await authenticatedRequest(`/api/modules?trail_id=${courseId}`);
        if (response.ok) {
            const modules = await response.json();
            renderCourseModules(modules);
        }
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

// Render course modules
function renderCourseModules(modules) {
    const container = document.getElementById('course-modules');
    
    if (!modules || modules.length === 0) {
        container.innerHTML = '<p>Nenhum módulo disponível.</p>';
        return;
    }
    
    container.innerHTML = `
        <h4>Módulos do Curso</h4>
        <div class="modules-list">
            ${modules.map((module, index) => `
                <div class="module-item">
                    <div class="module-info">
                        <div class="module-name">
                            <span class="module-number">${index + 1}.</span>
                            ${module.name}
                        </div>
                        <div class="module-description">${module.description || 'Descrição não disponível'}</div>
                    </div>
                    <div class="module-status">
                        <input type="checkbox" ${Math.random() > 0.5 ? 'checked' : ''} disabled>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Talhão functionality
function loadTalhaoData() {
    const completedTrails = userProgress.filter(p => p.progress === 100).length;
    const cornCount = completedTrails;
    const farmLevel = Math.floor(cornCount / 5) + 1;
    const nextExpansion = (farmLevel * 5) - cornCount;
    
    document.getElementById('corn-count').textContent = `${cornCount} 🌽`;
    document.getElementById('farm-level').textContent = `Nível ${farmLevel}`;
    document.getElementById('next-expansion').textContent = `${nextExpansion} trilhas`;
    
    renderFarmGrid(cornCount);
}

function renderFarmGrid(cornCount) {
    const grid = document.getElementById('farm-grid');
    const totalCells = 48; // 8x6 grid
    
    let gridHTML = '';
    for (let i = 0; i < totalCells; i++) {
        const hasCorn = i < cornCount;
        gridHTML += `<div class="farm-cell ${hasCorn ? 'corn' : ''}">${hasCorn ? '🌽' : ''}</div>`;
    }
    
    grid.innerHTML = gridHTML;
}

function closeTalhaoModal() {
    document.getElementById('talhao-modal').style.display = 'none';
}

// Ranking functionality
async function loadRankingData() {
    try {
        const response = await authenticatedRequest('/api/ranking');
        if (response.ok) {
            const rankings = await response.json();
            renderRanking(rankings);
            
            // Find user position
            const userRanking = rankings.find(r => r.id_user === currentUser.id);
            if (userRanking) {
                document.getElementById('user-position').textContent = `#${userRanking.position || '-'}`;
                document.getElementById('user-points').textContent = `${userRanking.score || 0} pontos`;
            }
        }
    } catch (error) {
        console.error('Error loading ranking:', error);
    }
}

function renderRanking(rankings) {
    const container = document.getElementById('ranking-list');
    
    if (!rankings || rankings.length === 0) {
        container.innerHTML = '<p>Nenhum ranking disponível.</p>';
        return;
    }
    
    container.innerHTML = rankings.slice(0, 10).map((rank, index) => `
        <div class="ranking-item ${rank.id_user === currentUser.id ? 'user-ranking' : ''}">
            <div class="ranking-position">#${index + 1}</div>
            <div class="ranking-user">
                <div class="user-avatar">${rank.first_name ? rank.first_name[0] : '?'}</div>
                <div class="user-info">
                    <div class="user-name">${rank.first_name || 'Usuário'} ${rank.last_name || ''}</div>
                    <div class="user-points">${rank.score || 0} pontos</div>
                </div>
            </div>
        </div>
    `).join('');
}

function showRankingTab(tabName) {
    // Update ranking display based on tab
    loadRankingData();
}

function closeRankingModal() {
    document.getElementById('ranking-modal').style.display = 'none';
}

// Test and certificate functions
function openTest() {
    showMessage('Sistema de provas será implementado em breve!', 'info');
    closeCourseModal();
}

function getCertificate() {
    showMessage('Gerando certificado... Esta funcionalidade será implementada em breve!', 'success');
    closeCourseModal();
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = ['course-modal', 'talhao-modal', 'ranking-modal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Close modals with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCourseModal();
        closeTalhaoModal();
        closeRankingModal();
    }
});

// Add custom styles for ranking
const rankingStyles = document.createElement('style');
rankingStyles.textContent = `
.ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--white);
    border-radius: var(--border-radius);
    margin-bottom: 0.5rem;
    box-shadow: var(--shadow);
}

.ranking-item.user-ranking {
    background: rgba(137, 211, 41, 0.1);
    border: 2px solid var(--accent-green);
}

.ranking-position {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--accent-green);
    min-width: 50px;
}

.ranking-user {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent-green);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-weight: bold;
}

.user-name {
    font-weight: 500;
    color: var(--primary-color);
}

.user-points {
    font-size: 0.9rem;
    color: var(--gray-dark);
}

.module-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--gray-medium);
    border-radius: var(--border-radius);
    margin-bottom: 0.5rem;
}

.module-number {
    font-weight: bold;
    color: var(--accent-green);
    margin-right: 0.5rem;
}

.module-status input[type="checkbox"] {
    transform: scale(1.2);
}
`;

document.head.appendChild(rankingStyles);