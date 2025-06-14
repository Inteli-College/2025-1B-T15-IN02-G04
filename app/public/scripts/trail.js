// Variáveis de controle
let currentTrailIndex = 0;
let currentModuleIndex = 0;
let trailsPerView = 4;
let modulesPerView = 3;

// Dados dos módulos para cada trilha
const trailModules = {
    1: {
        title: "JavaScript Fundamentals",
        modules: [
            {
                id: 1,
                title: "Introdução ao JavaScript",
                description: "Conceitos básicos, sintaxe e primeiro programa",
                duration: "2h 30min"
            },
            {
                id: 2,
                title: "Variáveis e Tipos de Dados",
                description: "Declaração de variáveis, tipos primitivos e objetos",
                duration: "1h 45min"
            },
            {
                id: 3,
                title: "Estruturas de Controle",
                description: "Condicionais, loops e estruturas de decisão",
                duration: "2h 15min"
            },
            {
                id: 4,
                title: "Funções e Escopo",
                description: "Declaração de funções, parâmetros e escopo de variáveis",
                duration: "3h 00min"
            },
            {
                id: 5,
                title: "Arrays e Objetos",
                description: "Manipulação de arrays, objetos e métodos úteis",
                duration: "2h 45min"
            }
        ]
    },
    2: {
        title: "Python para Iniciantes",
        modules: [
            {
                id: 1,
                title: "Primeiros Passos com Python",
                description: "Instalação, ambiente e sintaxe básica",
                duration: "2h 00min"
            },
            {
                id: 2,
                title: "Estruturas de Dados",
                description: "Listas, tuplas, dicionários e conjuntos",
                duration: "2h 30min"
            },
            {
                id: 3,
                title: "Programação Orientada a Objetos",
                description: "Classes, objetos, herança e polimorfismo",
                duration: "3h 15min"
            },
            {
                id: 4,
                title: "Manipulação de Arquivos",
                description: "Leitura, escrita e processamento de arquivos",
                duration: "1h 30min"
            },
            {
                id: 5,
                title: "Bibliotecas Populares",
                description: "NumPy, Pandas e Matplotlib básico",
                duration: "4h 00min"
            }
        ]
    },
    3: {
        title: "React Development",
        modules: [
            {
                id: 1,
                title: "Introdução ao React",
                description: "JSX, componentes e virtual DOM",
                duration: "2h 20min"
            },
            {
                id: 2,
                title: "Props e State",
                description: "Passagem de dados e gerenciamento de estado",
                duration: "2h 45min"
            },
            {
                id: 3,
                title: "Hooks Essenciais",
                description: "useState, useEffect e hooks customizados",
                duration: "3h 30min"
            },
            {
                id: 4,
                title: "Roteamento",
                description: "React Router e navegação entre páginas",
                duration: "2h 00min"
            },
            {
                id: 5,
                title: "Gerenciamento de Estado",
                description: "Context API e Redux básico",
                duration: "3h 45min"
            }
        ]
    },
    4: {
        title: "Node.js Backend",
        modules: [
            {
                id: 1,
                title: "Fundamentos do Node.js",
                description: "Event loop, módulos e sistema de arquivos",
                duration: "2h 15min"
            },
            {
                id: 2,
                title: "Express.js Framework",
                description: "Rotas, middleware e estrutura de APIs",
                duration: "3h 00min"
            },
            {
                id: 3,
                title: "Banco de Dados",
                description: "MongoDB, Mongoose e operações CRUD",
                duration: "3h 30min"
            },
            {
                id: 4,
                title: "Autenticação e Segurança",
                description: "JWT, bcrypt e boas práticas de segurança",
                duration: "2h 45min"
            },
            {
                id: 5,
                title: "Deploy e Produção",
                description: "Heroku, PM2 e monitoramento de aplicações",
                duration: "2h 00min"
            }
        ]
    },
    5: {
        title: "Banco de Dados",
        modules: [
            {
                id: 1,
                title: "Conceitos Fundamentais",
                description: "Modelos relacionais, chaves e normalização",
                duration: "2h 30min"
            },
            {
                id: 2,
                title: "SQL Básico",
                description: "SELECT, INSERT, UPDATE, DELETE e JOIN",
                duration: "3h 15min"
            },
            {
                id: 3,
                title: "SQL Avançado",
                description: "Subconsultas, funções agregadas e índices",
                duration: "3h 45min"
            },
            {
                id: 4,
                title: "NoSQL Databases",
                description: "MongoDB, Redis e quando usar cada um",
                duration: "2h 20min"
            },
            {
                id: 5,
                title: "Otimização e Performance",
                description: "Indexação, análise de queries e tuning",
                duration: "2h 50min"
            }
        ]
    },
    6: {
        title: "DevOps Essentials",
        modules: [
            {
                id: 1,
                title: "Introdução ao DevOps",
                description: "Cultura DevOps, ferramentas e metodologias",
                duration: "1h 45min"
            },
            {
                id: 2,
                title: "Controle de Versão",
                description: "Git avançado, branching strategies e workflows",
                duration: "2h 30min"
            },
            {
                id: 3,
                title: "CI/CD Pipelines",
                description: "GitHub Actions, Jenkins e automação",
                duration: "3h 20min"
            },
            {
                id: 4,
                title: "Containerização",
                description: "Docker, Docker Compose e orchestração",
                duration: "3h 00min"
            },
            {
                id: 5,
                title: "Monitoramento e Logs",
                description: "Prometheus, Grafana e análise de logs",
                duration: "2h 15min"
            }
        ]
    },
    7: {
        title: "Desenvolvimento Mobile",
        modules: [
            {
                id: 1,
                title: "React Native Basics",
                description: "Componentes nativos e navegação mobile",
                duration: "2h 45min"
            },
            {
                id: 2,
                title: "Flutter Development",
                description: "Dart language e widgets Flutter",
                duration: "3h 15min"
            },
            {
                id: 3,
                title: "App Store Deployment",
                description: "Publicação na Google Play e App Store",
                duration: "2h 00min"
            },
            {
                id: 4,
                title: "Performance Mobile",
                description: "Otimização e best practices mobile",
                duration: "2h 30min"
            }
        ]
    },
    8: {
        title: "Inteligência Artificial",
        modules: [
            {
                id: 1,
                title: "Fundamentos de IA",
                description: "Conceitos básicos de Machine Learning",
                duration: "3h 00min"
            },
            {
                id: 2,
                title: "Python para Data Science",
                description: "Pandas, NumPy e Matplotlib",
                duration: "4h 30min"
            },
            {
                id: 3,
                title: "Deep Learning",
                description: "Redes neurais com TensorFlow",
                duration: "5h 00min"
            },
            {
                id: 4,
                title: "Processamento de Linguagem Natural",
                description: "NLP e análise de texto",
                duration: "3h 45min"
            }
        ]
    }
};

// Função para controlar o carrossel das trilhas
function scrollCarousel(direction) {
    console.log('Navegando carrossel trilhas:', direction);
    
    const trailsGrid = document.querySelector('.trails-grid');
    const totalTrails = document.querySelectorAll('.trail-card').length;
    const maxIndex = Math.max(0, totalTrails - trailsPerView);
    
    currentTrailIndex += direction;
    
    if (currentTrailIndex < 0) {
        currentTrailIndex = 0;
    } else if (currentTrailIndex > maxIndex) {
        currentTrailIndex = maxIndex;
    }
    
    const translateX = currentTrailIndex * 320; // 300px width + 20px gap
    trailsGrid.style.transform = `translateX(-${translateX}px)`;
    
    console.log(`Novo índice: ${currentTrailIndex}, Transform: -${translateX}px`);
    
    updateCarouselButtons();
}

// Função para controlar o carrossel dos módulos
function scrollModulesCarousel(direction) {
    console.log('Navegando carrossel módulos:', direction);
    
    const modulesGrid = document.querySelector('.modules-grid');
    if (!modulesGrid) return;
    
    const totalModules = modulesGrid.querySelectorAll('.module-item').length;
    const maxIndex = Math.max(0, totalModules - modulesPerView);
    
    currentModuleIndex += direction;
    
    if (currentModuleIndex < 0) {
        currentModuleIndex = 0;
    } else if (currentModuleIndex > maxIndex) {
        currentModuleIndex = maxIndex;
    }
    
    const translateX = currentModuleIndex * 315; // 300px width + 15px gap
    modulesGrid.style.transform = `translateX(-${translateX}px)`;
    
    updateModuleButtons();
}

// Função para atualizar visibilidade dos botões do carrossel
function updateCarouselButtons() {
    const prevBtn = document.querySelector('.trails-carousel .prev-btn');
    const nextBtn = document.querySelector('.trails-carousel .next-btn');
    const totalTrails = document.querySelectorAll('.trail-card').length;
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentTrailIndex === 0;
        nextBtn.disabled = currentTrailIndex >= totalTrails - trailsPerView;
    }
}

// Função para atualizar botões dos módulos
function updateModuleButtons() {
    const prevBtn = document.querySelector('.modules-carousel .prev-btn');
    const nextBtn = document.querySelector('.modules-carousel .next-btn');
    const modulesGrid = document.querySelector('.modules-grid');
    
    if (!prevBtn || !nextBtn || !modulesGrid) return;
    
    const totalModules = modulesGrid.querySelectorAll('.module-item').length;
    
    prevBtn.disabled = currentModuleIndex === 0;
    nextBtn.disabled = currentModuleIndex >= totalModules - modulesPerView;
}

// Função para abrir o popup de módulos
function openModulePopup(trailId) {
    console.log('Abrindo popup trilha:', trailId);
    
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalTitle');
    const modulesList = document.getElementById('modulesList');
    
    const trail = trailModules[trailId];
    
    if (!trail) {
        console.error('Trilha não encontrada:', trailId);
        return;
    }
    
    // Resetar índice do carrossel de módulos
    currentModuleIndex = 0;
    
    // Atualizar título do modal
    modalTitle.textContent = `Módulos - ${trail.title}`;
    
    // Limpar lista de módulos
    modulesList.innerHTML = '';
    modulesList.style.transform = 'translateX(0)';
    
    // Adicionar módulos à lista
    trail.modules.forEach(module => {
        const moduleElement = createModuleElement(module, trailId);
        modulesList.appendChild(moduleElement);
    });
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Atualizar botões dos módulos
    setTimeout(() => {
        updateModuleButtons();
    }, 50);
}

// Função para criar elemento de módulo
function createModuleElement(module, trailId) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module-item';
    moduleDiv.onclick = () => accessModule(trailId, module.id);
    
    moduleDiv.innerHTML = `
        <div class="module-content">
            <h4>${module.title}</h4>
            <p>${module.description}</p>
        </div>
        <div class="module-duration">Duração: ${module.duration}</div>
    `;
    
    return moduleDiv;
}

// Função para fechar o popup
function closeModulePopup() {
    const modal = document.getElementById('moduleModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para acessar um módulo específico
function accessModule(trailId, moduleId) {
    const modulePageUrl = `/Aulas?trilha=${trailId}&modulo=${moduleId}`;
    window.location.href = modulePageUrl;

}

    closeModulePopup();

// Função para ajustar carrossel baseado no tamanho da tela
function adjustCarouselForScreen() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 480) {
        trailsPerView = 1;
        modulesPerView = 1;
    } else if (screenWidth <= 768) {
        trailsPerView = 2;
        modulesPerView = 2;
    } else if (screenWidth <= 1200) {
        trailsPerView = 3;
        modulesPerView = 2;
    } else {
        trailsPerView = 4;
        modulesPerView = 3;
    }
    
    // Resetar posições
    currentTrailIndex = 0;
    currentModuleIndex = 0;
    
    const trailsGrid = document.querySelector('.trails-grid');
    const modulesGrid = document.querySelector('.modules-grid');
    
    if (trailsGrid) trailsGrid.style.transform = 'translateX(0)';
    if (modulesGrid) modulesGrid.style.transform = 'translateX(0)';
    
    updateCarouselButtons();
}

// Animações para os cards
function addCardAnimations() {
    const cards = document.querySelectorAll('.trail-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Event listeners e inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de carrossel...');
    
    const modal = document.getElementById('moduleModal');
    
    // Inicializar animações
    setTimeout(addCardAnimations, 100);
    
    // Ajustar para diferentes tamanhos de tela
    window.addEventListener('resize', adjustCarouselForScreen);
    adjustCarouselForScreen();
    
    // Inicializar botões
    updateCarouselButtons();
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModulePopup();
        }
    });
    
    // Navegação por teclado
    document.addEventListener('keydown', function(event) {
        if (modal.style.display === 'block') {
            switch(event.key) {
                case 'Escape':
                    closeModulePopup();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    scrollModulesCarousel(-1);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    scrollModulesCarousel(1);
                    break;
            }
        } else {
            switch(event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    scrollCarousel(-1);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    scrollCarousel(1);
                    break;
            }
        }
    });
    
    console.log('Sistema inicializado com sucesso!');
});

// Funções de debug
function testCarousel() {
    console.log('=== TESTE DO CARROSSEL ===');
    console.log('Total trilhas:', document.querySelectorAll('.trail-card').length);
    console.log('Trilhas por view:', trailsPerView);
    console.log('Índice atual:', currentTrailIndex);
    
    scrollCarousel(1);
    setTimeout(() => scrollCarousel(-1), 1000);
}

// Expor funções globalmente para debug
window.testCarousel = testCarousel;
window.scrollCarousel = scrollCarousel;
window.scrollModulesCarousel = scrollModulesCarousel;