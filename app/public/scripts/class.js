// ========================================
// SISTEMA DE AULAS INTERATIVO
// ========================================

// Estado global do curso


let courseProgress = {
    currentLesson: 1,
    completedLessons: [],
    quizAnswers: {},
    totalScore: 0,
    moduleId: 1,
    moduleName: "JavaScript Fundamentals"
};

// Dados das aulas
const lessonsData = {
    1: {
        title: "Introdução ao JavaScript",
        type: "video",
        content: {
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Vídeo de exemplo
            description: "Nesta aula você aprenderá os conceitos básicos do JavaScript, sua sintaxe e como criar seu primeiro programa.",
            summary: "JavaScript é uma linguagem de programação dinâmica e versátil, amplamente utilizada no desenvolvimento web."
        },
        quiz: {
            question: "Qual é a principal função do JavaScript no desenvolvimento web?",
            options: [
                "Estilizar páginas web",
                "Adicionar interatividade às páginas",
                "Estruturar o conteúdo HTML",
                "Gerenciar bancos de dados"
            ],
            correct: 1,
            explanation: "JavaScript é usado principalmente para adicionar interatividade e comportamento dinâmico às páginas web."
        }
    },
    2: {
        title: "Variáveis e Tipos de Dados",
        type: "article",
        content: {
            article: `
                <h1>Variáveis e Tipos de Dados em JavaScript</h1>
                
                <h2>O que são Variáveis?</h2>
                <p>Variáveis são containers que armazenam valores de dados. Em JavaScript, você pode declarar variáveis usando <code>let</code>, <code>const</code> ou <code>var</code>.</p>
                
                <h2>Declarando Variáveis</h2>
                <div class="code-block">
let nome = "João";
const idade = 25;
var profissao = "Desenvolvedor";
                </div>
                
                <h2>Tipos de Dados Primitivos</h2>
                <p><strong>String:</strong> Representa texto</p>
                <div class="code-block">
let mensagem = "Olá, mundo!";
                </div>
                
                <p><strong>Number:</strong> Representa números</p>
                <div class="code-block">
let preco = 29.99;
let quantidade = 5;
                </div>
                
                <p><strong>Boolean:</strong> Representa verdadeiro ou falso</p>
                <div class="code-block">
let ativo = true;
let visivel = false;
                </div>
                
                <p><strong>Null e Undefined:</strong> Representam ausência de valor</p>
                <div class="code-block">
let valor = null;
let indefinido; // undefined
                </div>
                
                <h2>Verificando Tipos</h2>
                <p>Use o operador <code>typeof</code> para verificar o tipo de uma variável:</p>
                <div class="code-block">
console.log(typeof "JavaScript"); // "string"
console.log(typeof 42); // "number"
console.log(typeof true); // "boolean"
                </div>
            `
        },
        quiz: {
            question: "Qual palavra-chave é recomendada para declarar variáveis que não mudam de valor?",
            options: [
                "var",
                "let", 
                "const",
                "static"
            ],
            correct: 2,
            explanation: "A palavra-chave 'const' é usada para declarar constantes, ou seja, variáveis cujo valor não pode ser alterado após a declaração."
        }
    },
    3: {
        title: "Estruturas de Controle",
        type: "pdf",
        content: {
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // PDF de exemplo
            description: "Documento completo sobre estruturas de controle em JavaScript, incluindo condicionais e loops.",
            summary: "As estruturas de controle permitem que você controle o fluxo de execução do seu código JavaScript."
        },
        quiz: {
            question: "Qual estrutura de controle é usada para executar código repetidamente?",
            options: [
                "if...else",
                "switch",
                "for/while",
                "try...catch"
            ],
            correct: 2,
            explanation: "Os loops 'for' e 'while' são estruturas de controle usadas para executar código repetidamente."
        }
    },
    4: {
        title: "Funções em JavaScript",
        type: "interactive",
        content: {
            description: "Aprenda sobre funções criando e testando suas próprias funções JavaScript.",
            initialCode: `// Crie uma função que calcule a área de um retângulo
function calcularArea(largura, altura) {
    return largura * altura;
}

// Teste sua função
console.log(calcularArea(5, 3));`,
            explanation: "Funções são blocos de código reutilizáveis que executam uma tarefa específica."
        },
        quiz: {
            question: "Como você declara uma função em JavaScript?",
            options: [
                "function nomeDaFuncao() {}",
                "def nomeDaFuncao() {}",
                "func nomeDaFuncao() {}",
                "method nomeDaFuncao() {}"
            ],
            correct: 0,
            explanation: "Em JavaScript, funções são declaradas usando a palavra-chave 'function' seguida do nome da função."
        }
    },
    5: {
        title: "Arrays e Objetos",
        type: "video",
        content: {
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Vídeo de exemplo
            description: "Nesta aula você aprenderá sobre arrays e objetos, duas estruturas fundamentais do JavaScript.",
            summary: "Arrays e objetos são estruturas de dados essenciais para organizar e manipular informações em JavaScript."
        },
        quiz: {
            question: "Como você acessa o primeiro elemento de um array em JavaScript?",
            options: [
                "array[1]",
                "array[0]",
                "array.first()",
                "array.get(0)"
            ],
            correct: 1,
            explanation: "Em JavaScript, os arrays são indexados a partir de 0, então o primeiro elemento é acessado com array[0]."
        }
    },
    6: {
        title: "Prova Final do Módulo",
        type: "exam",
        content: {
            description: "Prova final com questões sobre todo o conteúdo do módulo JavaScript Fundamentals.",
            totalQuestions: 5
        },
        examQuestions: [
            {
                question: "Qual é a diferença entre '==' e '===' em JavaScript?",
                options: [
                    "Não há diferença",
                    "== compara valor, === compara valor e tipo",
                    "== é mais rápido que ===",
                    "=== é usado apenas para números"
                ],
                correct: 1
            },
            {
                question: "O que acontece quando você declara uma variável sem usar let, const ou var?",
                options: [
                    "Erro de sintaxe",
                    "A variável se torna local",
                    "A variável se torna global",
                    "A variável é undefined"
                ],
                correct: 2
            },
            {
                question: "Qual método é usado para adicionar um elemento ao final de um array?",
                options: [
                    "add()",
                    "append()",
                    "push()",
                    "insert()"
                ],
                correct: 2
            },
            {
                question: "Como você cria um comentário de linha única em JavaScript?",
                options: [
                    "# comentário",
                    "// comentário",
                    "<!-- comentário -->",
                    "/* comentário */"
                ],
                correct: 1
            },
            {
                question: "Qual é o resultado de: typeof null?",
                options: [
                    "'null'",
                    "'undefined'",
                    "'object'",
                    "'number'"
                ],
                correct: 2
            }
        ]
    }
};

// ========================================
// FUNÇÕES PRINCIPAIS
// ========================================

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de aulas...');
    loadProgress();
    setupEventListeners();
    loadLesson(courseProgress.currentLesson);
    updateProgress();
});

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para items de aula
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        item.addEventListener('click', function() {
            const lessonId = parseInt(this.dataset.lesson);
            
            // Verificar se a aula está desbloqueada
            if (isLessonUnlocked(lessonId)) {
                selectLesson(lessonId);
                loadLesson(lessonId);
            } else {
                alert('Complete as aulas anteriores para desbloquear esta aula.');
            }
        });
    });
}

// Verificar se a aula está desbloqueada
function isLessonUnlocked(lessonId) {
    if (lessonId === 1) return true;
    if (lessonId === 6) {
        // Prova final só é desbloqueada se todas as outras aulas estão completas
        return courseProgress.completedLessons.length >= 5;
    }
    return courseProgress.completedLessons.includes(lessonId - 1);
}

// Selecionar aula no menu
function selectLesson(lessonId) {
    // Remover seleção anterior
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar seleção atual
    const selectedItem = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    courseProgress.currentLesson = lessonId;
    saveProgress();
}

// Carregar conteúdo da aula
function loadLesson(lessonId) {
    const lesson = lessonsData[lessonId];
    if (!lesson) {
        console.error('Aula não encontrada:', lessonId);
        return;
    }
    
    const contentArea = document.getElementById('lessonContent');
    const quizSection = document.getElementById('quizSection');
    
    // Limpar conteúdo anterior
    contentArea.innerHTML = '';
    quizSection.style.display = 'none';
    
    console.log('Carregando aula:', lesson.title, 'Tipo:', lesson.type);
    
    // Carregar conteúdo baseado no tipo
    switch (lesson.type) {
        case 'video':
            loadVideoContent(lesson, contentArea);
            break;
        case 'article':
            loadArticleContent(lesson, contentArea);
            break;
        case 'pdf':
            loadPdfContent(lesson, contentArea);
            break;
        case 'interactive':
            loadInteractiveContent(lesson, contentArea);
            break;
        case 'exam':
            loadExamContent(lesson, contentArea);
            return; // Prova não tem quiz individual
    }
    
    // Mostrar quiz se não for prova final
    if (lesson.type !== 'exam') {
        setTimeout(() => {
            showQuiz(lesson.quiz, lessonId);
        }, 1000);
    }
}

// Carregar conteúdo de vídeo
function loadVideoContent(lesson, container) {
    container.innerHTML = `
        <div class="video-content">
            <h2>${lesson.title}</h2>
            <video controls width="100%" style="max-width: 800px;">
                <source src="${lesson.content.videoUrl}" type="video/mp4">
                Seu navegador não suporta vídeos HTML5.
            </video>
            <div style="margin-top: 20px; color: #333;">
                <h3>Sobre esta aula</h3>
                <p>${lesson.content.description}</p>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <strong>Resumo:</strong> ${lesson.content.summary}
                </div>
            </div>
        </div>
    `;
}

// Carregar conteúdo de artigo
function loadArticleContent(lesson, container) {
    container.innerHTML = `
        <div class="article-content">
            ${lesson.content.article}
        </div>
    `;
}

// Carregar conteúdo PDF
function loadPdfContent(lesson, container) {
    container.innerHTML = `
        <div class="pdf-content">
            <h2>${lesson.title}</h2>
            <p style="color: #333; margin-bottom: 20px;">${lesson.content.description}</p>
            <iframe src="${lesson.content.pdfUrl}" class="pdf-viewer"></iframe>
            <div style="margin-top: 20px; color: #333;">
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
                    <strong>Resumo:</strong> ${lesson.content.summary}
                </div>
            </div>
        </div>
    `;
}

// Carregar conteúdo interativo
function loadInteractiveContent(lesson, container) {
    container.innerHTML = `
        <div class="interactive-content">
            <h2>${lesson.title}</h2>
            <p style="color: #333; margin-bottom: 20px;">${lesson.content.description}</p>
            
            <div class="code-editor">
                <h3 style="color: #00BCFF; margin-bottom: 15px;">Editor de Código JavaScript</h3>
                <textarea id="codeEditor" placeholder="Digite seu código JavaScript aqui...">${lesson.content.initialCode}</textarea>
                <button class="run-code-btn" onclick="runCode()">▶ Executar Código</button>
            </div>
            
            <div class="code-output" id="codeOutput">
                <strong>Saída do código aparecerá aqui...</strong>
            </div>
            
            <div style="margin-top: 20px; color: #333;">
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
                    <strong>Dica:</strong> ${lesson.content.explanation}
                </div>
            </div>
        </div>
    `;
}

// Carregar prova final
function loadExamContent(lesson, container) {
    if (courseProgress.completedLessons.length < 5) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h2>🔒 Prova Final Bloqueada</h2>
                <p>Complete todas as aulas anteriores para desbloquear a prova final.</p>
                <p>Progresso: ${courseProgress.completedLessons.length}/5 aulas concluídas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <h2>🎯 Prova Final - ${courseProgress.moduleName}</h2>
            <p style="color: #333; font-size: 1.1rem; margin: 20px 0;">
                Esta é a prova final do módulo. Você precisa obter pelo menos 60% de acertos para ser aprovado.
            </p>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <strong>Instruções:</strong><br>
                • ${lesson.content.totalQuestions} questões de múltipla escolha<br>
                • Tempo recomendado: 45 minutos<br>
                • Cada questão vale 20 pontos<br>
                • Pontuação mínima para aprovação: 60%
            </div>
            <button class="btn-primary" onclick="startExam()" style="font-size: 1.2rem; padding: 15px 30px;">
                Iniciar Prova Final
            </button>
        </div>
    `;
}

// Executar código JavaScript
function runCode() {
    const code = document.getElementById('codeEditor').value;
    const outputDiv = document.getElementById('codeOutput');
    
    try {
        // Capturar console.log
        let output = '';
        const originalLog = console.log;
        console.log = function(...args) {
            output += args.join(' ') + '\n';
            originalLog.apply(console, args);
        };
        
        // Executar código
        eval(code);
        
        // Restaurar console.log
        console.log = originalLog;
        
        // Mostrar resultado
        outputDiv.innerHTML = `<strong>Resultado:</strong><br><pre>${output || 'Código executado com sucesso!'}</pre>`;
        outputDiv.style.borderColor = '#89D329';
        
    } catch (error) {
        outputDiv.innerHTML = `<strong>Erro:</strong><br><pre style="color: #ff4444;">${error.message}</pre>`;
        outputDiv.style.borderColor = '#ff4444';
    }
}

// Mostrar quiz
function showQuiz(quiz, lessonId) {
    const quizSection = document.getElementById('quizSection');
    const questionContainer = document.getElementById('questionContainer');
    
    questionContainer.innerHTML = `
        <div class="question">${quiz.question}</div>
        <div class="options">
            ${quiz.options.map((option, index) => `
                <div class="option" data-option="${index}" onclick="selectOption(${index})">
                    ${String.fromCharCode(65 + index)}. ${option}
                </div>
            `).join('')}
        </div>
    `;
    
    quizSection.style.display = 'block';
    
    // Reset do quiz
    const submitBtn = document.getElementById('submitQuiz');
    const nextBtn = document.getElementById('nextLesson');
    const feedback = document.getElementById('quizFeedback');
    
    submitBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';
    feedback.innerHTML = '';
    feedback.className = 'quiz-feedback';
    
    // Armazenar dados do quiz atual
    window.currentQuiz = { quiz, lessonId };
}

// Selecionar opção do quiz
function selectOption(optionIndex) {
    // Remover seleção anterior
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Adicionar nova seleção
    const selectedOption = document.querySelector(`[data-option="${optionIndex}"]`);
    selectedOption.classList.add('selected');
    
    // Armazenar resposta
    window.selectedAnswer = optionIndex;
}

// Enviar resposta do quiz
function submitQuiz() {
    if (window.selectedAnswer === undefined) {
        alert('Por favor, selecione uma resposta antes de enviar.');
        return;
    }
    
    const { quiz, lessonId } = window.currentQuiz;
    const isCorrect = window.selectedAnswer === quiz.correct;
    
    // Marcar opções como corretas/incorretas
    document.querySelectorAll('.option').forEach((opt, index) => {
        opt.onclick = null; // Desabilitar cliques
        if (index === quiz.correct) {
            opt.classList.add('correct');
        } else if (index === window.selectedAnswer && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Mostrar feedback
    const feedback = document.getElementById('quizFeedback');
    if (isCorrect) {
        feedback.innerHTML = `
            <div>✅ <strong>Correto!</strong></div>
            <div style="margin-top: 10px;">${quiz.explanation}</div>
        `;
        feedback.className = 'quiz-feedback correct';
        
        // Marcar aula como concluída
        completeLesson(lessonId);
    } else {
        feedback.innerHTML = `
            <div>❌ <strong>Incorreto!</strong></div>
            <div style="margin-top: 10px;">Resposta correta: ${String.fromCharCode(65 + quiz.correct)}. ${quiz.options[quiz.correct]}</div>
            <div style="margin-top: 10px;">${quiz.explanation}</div>
        `;
        feedback.className = 'quiz-feedback incorrect';
    }
    
    // Armazenar resposta
    courseProgress.quizAnswers[lessonId] = {
        selected: window.selectedAnswer,
        correct: quiz.correct,
        isCorrect: isCorrect
    };
    
    // Mostrar botão próxima aula
    document.getElementById('submitQuiz').style.display = 'none';
    document.getElementById('nextLesson').style.display = 'inline-block';
    
    saveProgress();
    updateProgress();
}

// Marcar aula como concluída
function completeLesson(lessonId) {
    if (!courseProgress.completedLessons.includes(lessonId)) {
        courseProgress.completedLessons.push(lessonId);
        
        // Atualizar visual da aula
        const lessonItem = document.querySelector(`[data-lesson="${lessonId}"]`);
        if (lessonItem) {
            lessonItem.classList.add('completed');
            const statusElement = lessonItem.querySelector('.lesson-status');
            statusElement.textContent = '✅';
        }
        
        // Desbloquear próxima aula
        const nextLessonItem = document.querySelector(`[data-lesson="${lessonId + 1}"]`);
        if (nextLessonItem) {
            const nextStatusElement = nextLessonItem.querySelector('.lesson-status');
            if (lessonId === 5) {
                // Desbloquear prova final
                nextStatusElement.textContent = '🎯';
            } else {
                nextStatusElement.textContent = '🔵';
            }
        }
        
        console.log('Aula concluída:', lessonId);
    }
}

// Próxima aula
function nextLesson() {
    const nextLessonId = courseProgress.currentLesson + 1;
    if (nextLessonId <= 6) {
        selectLesson(nextLessonId);
        loadLesson(nextLessonId);
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert('Parabéns! Você concluiu todas as aulas do módulo.');
    }
}

// Iniciar prova final
function startExam() {
    const lesson = lessonsData[6];
    let currentQuestion = 0;
    let examAnswers = [];
    
    function showExamQuestion(questionIndex) {
        const question = lesson.examQuestions[questionIndex];
        const contentArea = document.getElementById('lessonContent');
        
        contentArea.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>Prova Final</h2>
                    <div style="background: #f0f8ff; padding: 10px 20px; border-radius: 8px; color: #10384F;">
                        Questão ${questionIndex + 1} de ${lesson.examQuestions.length}
                    </div>
                </div>
                
                <div class="question" style="color: #10384F; font-size: 1.2rem; margin-bottom: 25px;">
                    ${question.question}
                </div>
                
                <div class="options">
                    ${question.options.map((option, index) => `
                        <div class="option exam-option" data-option="${index}" onclick="selectExamOption(${index})">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 15px;">
                    ${questionIndex > 0 ? `<button class="btn-secondary" onclick="previousExamQuestion()">⬅ Anterior</button>` : ''}
                    <button class="btn-primary" id="examNextBtn" onclick="nextExamQuestion()" disabled>
                        ${questionIndex === lesson.examQuestions.length - 1 ? 'Finalizar Prova' : 'Próxima ➡'}
                    </button>
                </div>
            </div>
        `;
        
        // Restaurar resposta anterior se existir
        if (examAnswers[questionIndex] !== undefined) {
            const savedOption = document.querySelector(`[data-option="${examAnswers[questionIndex]}"]`);
            if (savedOption) {
                savedOption.classList.add('selected');
                document.getElementById('examNextBtn').disabled = false;
            }
        }
    }
    
    // Função global para selecionar opção do exame
    window.selectExamOption = function(optionIndex) {
        document.querySelectorAll('.exam-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`[data-option="${optionIndex}"]`);
        selectedOption.classList.add('selected');
        
        examAnswers[currentQuestion] = optionIndex;
        document.getElementById('examNextBtn').disabled = false;
    };
    
    // Função global para próxima questão
    window.nextExamQuestion = function() {
        if (currentQuestion === lesson.examQuestions.length - 1) {
            finishExam();
        } else {
            currentQuestion++;
            showExamQuestion(currentQuestion);
        }
    };
    
    // Função global para questão anterior
    window.previousExamQuestion = function() {
        if (currentQuestion > 0) {
            currentQuestion--;
            showExamQuestion(currentQuestion);
        }
    };
    
    // Função para finalizar exame
    function finishExam() {
        let correctAnswers = 0;
        
        lesson.examQuestions.forEach((question, index) => {
            if (examAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / lesson.examQuestions.length) * 100);
        const passed = score >= 60;
        
        courseProgress.totalScore = score;
        
        if (passed) {
            completeLesson(6);
            showCertificate(score);
        } else {
            showExamResult(score, false);
        }
        
        saveProgress();
        updateProgress();
    }
    
    // Iniciar com primeira questão
    showExamQuestion(0);
}

// Mostrar resultado do exame
function showExamResult(score, passed) {
    const contentArea = document.getElementById('lessonContent');
    
    contentArea.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">
                ${passed ? '🎉' : '😞'}
            </div>
            <h2 style="color: ${passed ? '#89D329' : '#ff4444'}; margin-bottom: 20px;">
                ${passed ? 'Parabéns! Você foi aprovado!' : 'Você não foi aprovado desta vez'}
            </h2>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; color: #10384F;">
                <div style="font-size: 2rem; font-weight: bold; margin-bottom: 10px;">
                    Sua pontuação: ${score}%
                </div>
                <div>
                    ${passed ? 'Pontuação necessária: 60%' : 'Pontuação necessária: 60% (você pode tentar novamente)'}
                </div>
            </div>
            ${!passed ? `
                <button class="btn-primary" onclick="startExam()" style="font-size: 1.1rem; padding: 12px 25px;">
                    Tentar Novamente
                </button>
            ` : ''}
        </div>
    `;
}

// Mostrar certificado
function showCertificate(score) {
    document.getElementById('finalScore').textContent = score + '%';
    document.getElementById('certificateModal').style.display = 'block';
}

// Fechar certificado
function closeCertificate() {
    document.getElementById('certificateModal').style.display = 'none';
}

// Atualizar barra de progresso
function updateProgress() {
    const totalLessons = 6;
    const completedCount = courseProgress.completedLessons.length;
    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        progressFill.style.width = progressPercentage + '%';
        progressText.textContent = progressPercentage + '% Concluído';
    }
    
    console.log('Progresso atualizado:', progressPercentage + '%');
}

// Salvar progresso no localStorage
function saveProgress() {
    try {
        localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
        console.log('Progresso salvo:', courseProgress);
    } catch (error) {
        console.warn('Erro ao salvar progresso:', error);
    }
}

// Carregar progresso do localStorage
function loadProgress() {
    try {
        const saved = localStorage.getItem('courseProgress');
        if (saved) {
            const savedProgress = JSON.parse(saved);
            courseProgress = { ...courseProgress, ...savedProgress };
            
            // Atualizar visual das aulas concluídas
            courseProgress.completedLessons.forEach(lessonId => {
                const lessonItem = document.querySelector(`[data-lesson="${lessonId}"]`);
                if (lessonItem) {
                    lessonItem.classList.add('completed');
                    const statusElement = lessonItem.querySelector('.lesson-status');
                    statusElement.textContent = '✅';
                }
            });
            
            // Desbloquear próximas aulas
            for (let i = 1; i <= 6; i++) {
                if (isLessonUnlocked(i)) {
                    const lessonItem = document.querySelector(`[data-lesson="${i}"]`);
                    if (lessonItem && !courseProgress.completedLessons.includes(i)) {
                        const statusElement = lessonItem.querySelector('.lesson-status');
                        if (i === 6) {
                            statusElement.textContent = '🎯';
                        } else {
                            statusElement.textContent = '🔵';
                        }
                    }
                }
            }
            
            console.log('Progresso carregado:', courseProgress);
        }
    } catch (error) {
        console.warn('Erro ao carregar progresso:', error);
    }
}

// Voltar para módulos
function goBack() {
    if (confirm('Tem certeza que deseja voltar? Seu progresso será salvo.')) {
        // Simular voltar para página de módulos
        alert('Voltando para a página de módulos...\n\nEm uma aplicação real, isso seria um redirecionamento para /modules ou similar.');
        // window.location.href = '/modules'; // Descomente em produção
    }
}

// Funções de debug
function resetProgress() {
    if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
        localStorage.removeItem('courseProgress');
        location.reload();
    }
}

// Expor funções globalmente para debug
window.resetProgress = resetProgress;
window.courseProgress = courseProgress;

console.log('Sistema de aulas carregado com sucesso!');