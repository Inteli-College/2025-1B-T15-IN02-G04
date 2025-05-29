// Load popular courses
document.addEventListener('DOMContentLoaded', async function() {
    await loadPopularCourses();
});

async function loadPopularCourses() {
    const grid = document.getElementById('popular-courses-grid');
    
    try {
        // Simular carregamento de cursos populares
        const courses = [
            {
                id: 1,
                title: 'Agricultura Digital 4.0',
                description: 'Aprenda sobre IoT, sensores e análise de dados aplicados ao campo.',
                duration: '8 horas',
                students: 1234,
                icon: '📱'
            },
            {
                id: 2,
                title: 'Sustentabilidade no Agro',
                description: 'Práticas sustentáveis para uma agricultura mais eficiente e responsável.',
                duration: '6 horas',
                students: 987,
                icon: '🌱'
            },
            {
                id: 3,
                title: 'Biotecnologia Agrícola',
                description: 'Conheça as mais recentes inovações em biotecnologia para o campo.',
                duration: '10 horas',
                students: 756,
                icon: '🔬'
            }
        ];
        
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        grid.innerHTML = courses.map(course => `
            <div class="course-card fade-in-up">
                <div class="course-image">
                    ${course.icon}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span>⏱️ ${course.duration}</span>
                        <span>👥 ${course.students.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Trigger animations
        const cards = grid.querySelectorAll('.course-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in-up');
            }, index * 200);
        });
        
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        grid.innerHTML = `
            <div class="course-card-placeholder">
                <p>Erro ao carregar cursos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

