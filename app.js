// DOM Elements
const modeSelectionSection = document.getElementById('mode-selection');
const learnModeSection = document.getElementById('learn-mode');
const quizModeSection = document.getElementById('quiz-mode');
const captchaModeSection = document.getElementById('captcha-mode');

const learnModeBtn = document.getElementById('learn-mode-btn');
const quizModeBtn = document.getElementById('quiz-mode-btn');
const captchaModeBtn = document.getElementById('captcha-mode-btn');

const backFromLearnBtn = document.getElementById('back-from-learn');
const backFromQuizBtn = document.getElementById('back-from-quiz');
const backFromCaptchaBtn = document.getElementById('back-from-captcha');

const learnComponentsGrid = document.getElementById('learn-components');
const quizImageElement = document.getElementById('quiz-image');
const quizOptionsContainer = document.getElementById('quiz-options');
const quizScoreElement = document.getElementById('quiz-score');

const captchaTargetElement = document.getElementById('captcha-target');
const captchaGridElement = document.getElementById('captcha-grid');
const captchaScoreElement = document.getElementById('captcha-score');

// Diagram elements
const quizDiagramBtn = document.getElementById('quiz-diagram-btn');
const captchaDiagramBtn = document.getElementById('captcha-diagram-btn');
const diagramModal = document.getElementById('diagram-modal');
const diagramImage = document.getElementById('diagram-image');

// Component detail elements
const componentModal = document.getElementById('component-modal');
const componentDetailImg = document.getElementById('component-detail-img');
const componentDetailName = document.getElementById('component-detail-name');
const componentDetailDescription = document.getElementById('component-detail-description');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Audio elements
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

// Game state
let quizScore = 0;
let captchaScore = 0;
let currentQuizAnswer = '';
let currentCaptchaAnswer = '';
let components = [];
let componentDescriptions = [];
let typingSpeed = 30; // milliseconds per character
let typingTimeout = null;

// Question queues
let quizQueue = [];
let captchaQueue = [];

// Initialize the application
function init() {
    loadComponents();
    loadComponentDescriptions();
    setupEventListeners();
    
    // Add error handling for all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', handleImageError);
    });
}

// Load all component images and their names
function loadComponents() {
    // List of all component images
    const componentFiles = [
        'Automation, Control, Protection (1).png',
        'Automation, Control, Protection.png',
        'Gate (1).png',
        'Gate.png',
        'Generator.png',
        'Head Water.png',
        'High Voltage Switch Gear.png',
        'Inlet Valve.png',
        'Medium Voltage Switch Gear.png',
        'Power Transformer.png',
        'Tail Water.png',
        'Transmission Line.png',
        'Turbine.png'
    ];

    // Process each file to extract component name and create component object
    componentFiles.forEach(file => {
        // Extract component name from filename (remove extension and any numbering)
        let name = file.replace(/\.[^/.]+$/, ''); // Remove file extension
        name = name.replace(/ \(\d+\)$/, ''); // Remove any numbering like (1)

        components.push({
            name: name,
            image: `images/${file}`,
            filename: file
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Mode selection buttons
    learnModeBtn.addEventListener('click', startLearnMode);
    quizModeBtn.addEventListener('click', startQuizMode);
    captchaModeBtn.addEventListener('click', startCaptchaMode);

    // Back buttons
    backFromLearnBtn.addEventListener('click', goBackToModeSelection);
    backFromQuizBtn.addEventListener('click', goBackToModeSelection);
    backFromCaptchaBtn.addEventListener('click', goBackToModeSelection);

    // Diagram buttons
    quizDiagramBtn.addEventListener('click', openDiagramModal);
    captchaDiagramBtn.addEventListener('click', openDiagramModal);

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal === diagramModal) {
                closeDiagramModal();
            } else if (modal === componentModal) {
                closeComponentModal();
            }
        });
    });

    // Close modals when clicking outside of them
    window.addEventListener('click', (e) => {
        if (e.target === diagramModal) {
            closeDiagramModal();
        } else if (e.target === componentModal) {
            closeComponentModal();
        }
    });

    // Toggle zoom on diagram image click
    diagramImage.addEventListener('click', toggleDiagramZoom);

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!diagramModal.classList.contains('hidden')) {
                closeDiagramModal();
            } else if (!componentModal.classList.contains('hidden')) {
                closeComponentModal();
            }
        }
    });
}

// Show mode selection and hide all other sections
function goBackToModeSelection() {
    modeSelectionSection.classList.remove('hidden');
    learnModeSection.classList.add('hidden');
    quizModeSection.classList.add('hidden');
    captchaModeSection.classList.add('hidden');
}

// Load component descriptions from JSON file
function loadComponentDescriptions() {
    fetch('components.json')
        .then(response => response.json())
        .then(data => {
            componentDescriptions = data;
        })
        .catch(error => {
            console.error('Error loading component descriptions:', error);
        });
}

// Start Learn Mode
function startLearnMode() {
    modeSelectionSection.classList.add('hidden');
    learnModeSection.classList.remove('hidden');

    // Clear previous content
    learnComponentsGrid.innerHTML = '';

    // Create a card for each component
    components.forEach(component => {
        const card = document.createElement('div');
        card.className = 'component-card';

        const img = document.createElement('img');
        img.src = component.image;
        img.alt = component.name;
        img.loading = 'lazy'; // Add lazy loading

        const nameDiv = document.createElement('div');
        nameDiv.className = 'component-name';
        nameDiv.textContent = component.name;

        card.appendChild(img);
        card.appendChild(nameDiv);
        
        // Optimize event listener
        card.addEventListener('click', () => {
            showComponentDetail(component);
        }, { passive: true });
        
        learnComponentsGrid.appendChild(card);
    });
}

// Start Quiz Mode
function startQuizMode() {
    modeSelectionSection.classList.add('hidden');
    quizModeSection.classList.remove('hidden');

    // Reset score
    quizScore = 0;
    quizScoreElement.textContent = quizScore;

    // Initialize the quiz queue with all unique component names
    initializeQuizQueue();

    // Start the first question
    loadNextQuizQuestion();
}

// Initialize the quiz queue with all unique component names
function initializeQuizQueue() {
    // Get all unique component names
    const uniqueComponents = getUniqueComponents();

    // Create a new queue and shuffle it
    quizQueue = [...uniqueComponents];
    shuffleArray(quizQueue);
}

// Get all unique components (no duplicate names)
function getUniqueComponents() {
    const uniqueComponents = [];
    const usedNames = new Set();

    components.forEach(component => {
        if (!usedNames.has(component.name)) {
            uniqueComponents.push(component);
            usedNames.add(component.name);
        }
    });

    return uniqueComponents;
}

// Load the next quiz question
function loadNextQuizQuestion() {
    // Clear previous options
    quizOptionsContainer.innerHTML = '';

    // If the queue is empty, refill it
    if (quizQueue.length === 0) {
        initializeQuizQueue();
    }

    // Get the next component from the queue
    const correctComponent = quizQueue.pop();
    currentQuizAnswer = correctComponent.name;

    // Set the image
    quizImageElement.src = correctComponent.image;
    quizImageElement.alt = correctComponent.name;

    // Generate 3 wrong options (ensure they're unique)
    const wrongOptions = getUniqueRandomComponents(3, correctComponent.name);

    // Combine correct and wrong options, then shuffle
    const allOptions = [correctComponent.name, ...wrongOptions.map(c => c.name)];
    shuffleArray(allOptions);

    // Create option buttons
    allOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => checkQuizAnswer(option, button));
        quizOptionsContainer.appendChild(button);
    });
}

// Check the user's quiz answer
function checkQuizAnswer(selectedAnswer, buttonElement) {
    const isCorrect = selectedAnswer === currentQuizAnswer;

    // Disable all buttons
    const allButtons = quizOptionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuizAnswer) {
            btn.classList.add('correct');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Play sound
    if (isCorrect) {
        correctSound.play();
        quizScore++;
        quizScoreElement.textContent = quizScore;
    } else {
        incorrectSound.play();
    }

    // Load next question after a delay
    setTimeout(() => {
        loadNextQuizQuestion();
    }, 1500);
}

// Start Captcha Mode
function startCaptchaMode() {
    modeSelectionSection.classList.add('hidden');
    captchaModeSection.classList.remove('hidden');

    // Reset score
    captchaScore = 0;
    captchaScoreElement.textContent = captchaScore;

    // Initialize the captcha queue with all unique component names
    initializeCaptchaQueue();

    // Start the first captcha challenge
    loadNextCaptchaChallenge();
}

// Initialize the captcha queue with all unique component names
function initializeCaptchaQueue() {
    // Get all unique component names
    const uniqueComponents = getUniqueComponents();

    // Create a new queue and shuffle it
    captchaQueue = [...uniqueComponents];
    shuffleArray(captchaQueue);
}

// Load the next captcha challenge
function loadNextCaptchaChallenge() {
    // Clear previous grid
    captchaGridElement.innerHTML = '';

    // If the queue is empty, refill it
    if (captchaQueue.length === 0) {
        initializeCaptchaQueue();
    }

    // Get the next component from the queue as the target
    const targetComponent = captchaQueue.pop();
    currentCaptchaAnswer = targetComponent.name;

    // Get 3 more unique components for the grid (different from the target)
    const otherComponents = getUniqueRandomComponents(3, targetComponent.name);

    // Combine target and other components, then shuffle for grid placement
    const gridComponents = [targetComponent, ...otherComponents];
    shuffleArray(gridComponents);

    // Set the target text
    captchaTargetElement.textContent = targetComponent.name;

    // Create the grid
    gridComponents.forEach((component) => {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'captcha-image';
        imageContainer.dataset.name = component.name;

        const img = document.createElement('img');
        img.src = component.image;
        img.alt = component.name;

        imageContainer.appendChild(img);
        imageContainer.addEventListener('click', () => checkCaptchaAnswer(component.name, imageContainer));
        captchaGridElement.appendChild(imageContainer);
    });
}

// Check the user's captcha answer
function checkCaptchaAnswer(selectedName, imageElement) {
    const isCorrect = selectedName === currentCaptchaAnswer;

    if (isCorrect) {
        correctSound.play();
        captchaScore++;
        captchaScoreElement.textContent = captchaScore;

        // Load next challenge after a delay
        setTimeout(() => {
            loadNextCaptchaChallenge();
        }, 1000);
    } else {
        incorrectSound.play();
        imageElement.classList.add('incorrect');

        // Remove the incorrect class after a delay
        setTimeout(() => {
            imageElement.classList.remove('incorrect');
        }, 1000);
    }
}

// Helper function to get unique random components
function getUniqueRandomComponents(count, excludeName = null) {
    // Filter out components with the same name as excludeName
    let availableComponents = components.filter(c => c.name !== excludeName);

    // Filter out components with duplicate names
    const uniqueNameComponents = [];
    const usedNames = new Set();

    availableComponents.forEach(component => {
        if (!usedNames.has(component.name)) {
            uniqueNameComponents.push(component);
            usedNames.add(component.name);
        }
    });

    // Shuffle and take the first 'count' components
    shuffleArray(uniqueNameComponents);
    return uniqueNameComponents.slice(0, count);
}

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Open the diagram modal
function openDiagramModal() {
    diagramModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
}

// Close the diagram modal
function closeDiagramModal() {
    diagramModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling

    // Reset zoom when closing
    if (diagramImage.classList.contains('zoomed')) {
        diagramImage.classList.remove('zoomed');
    }
}

// Toggle zoom on diagram image
function toggleDiagramZoom() {
    diagramImage.classList.toggle('zoomed');
}

// Show component detail modal
function showComponentDetail(component) {
    // Find component info
    const componentInfo = componentDescriptions.find(desc => 
        desc.name.toLowerCase() === component.name.toLowerCase());

    if (!componentInfo) {
        console.error('Component description not found:', component.name);
        return;
    }

    // Reset modal state
    componentDetailDescription.classList.remove('typing-complete');
    componentDetailDescription.textContent = '';
    
    // Clear any existing typing animation
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }

    // Set the component details
    componentDetailImg.src = component.image;
    componentDetailImg.alt = component.name;
    componentDetailName.textContent = componentInfo.name;

    // Open the modal
    componentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Start typing effect after a short delay to ensure modal is visible
    setTimeout(() => {
        typeDescription(componentInfo.description, 0);
    }, 100);
}

// Close the component detail modal
function closeComponentModal() {
    componentModal.classList.add('hidden');
    document.body.style.overflow = '';

    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }

    // Reset modal content
    componentDetailDescription.textContent = '';
    componentDetailDescription.classList.remove('typing-complete');
}

// Typing effect for component description
function typeDescription(text, index) {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }

    if (!text || index >= text.length) {
        componentDetailDescription.classList.add('typing-complete');
        return;
    }

    componentDetailDescription.textContent += text.charAt(index);
    typingTimeout = setTimeout(() => typeDescription(text, index + 1), typingSpeed);
}

// Add error handling for image loading
function handleImageError(event) {
    console.error('Error loading image:', event.target.src);
    event.target.src = 'images/placeholder.png'; // Add a placeholder image
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

