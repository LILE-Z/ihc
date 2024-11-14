// Preguntas y respuestas del juego
const questions = [
    {
        question: "I am green. I have no legs. Who am I?", correctAnswer: "snake", options: ["dog", "snake", "sheep", "cat"]
    },
    {
        question: "I am big, have a trunk, and large ears. Who am I?",
        correctAnswer: "elephant",
        options: ["lion", "elephant", "monkey", "tiger"]
    },
    {
        question: "I am a bird, I can swim but cannot fly. Who am I?",
        correctAnswer: "penguin",
        options: ["eagle", "parrot", "penguin", "owl"]
    },
    {
        question: "I am known for my mane and I am called the king of the jungle. Who am I?",
        correctAnswer: "lion",
        options: ["elephant", "cat", "dog", "lion"]
    },
    {
        question: "I am small, I love cheese, and people keep me as a pet. Who am I?",
        correctAnswer: "mouse",
        options: ["rabbit", "hamster", "mouse", "squirrel"]
    },
    {
        question: "I live in water, have fins, and breathe through gills. Who am I?",
        correctAnswer: "fish",
        options: ["frog", "bird", "fish", "turtle"]
    },
    {
        question: "I am black and white, I eat bamboo, and I am very cute. Who am I?",
        correctAnswer: "panda",
        options: ["bear", "dog", "panda", "cow"]
    }
];

// Función para crear las preguntas y opciones en el HTML
function loadQuiz() {
    const quizContainer = document.getElementById("quiz-container");

    questions.forEach((q, index) => {
        // Crear contenedor para cada pregunta
        const questionContainer = document.createElement("div");
        questionContainer.classList.add("quiz-container");

        // Agregar la pregunta
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.textContent = q.question;
        questionContainer.appendChild(questionElement);

        // Crear opciones de respuesta
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options");

        q.options.forEach(option => {
            const optionElement = document.createElement("div");
            optionElement.classList.add("option");
            optionElement.onclick = () => selectOption(optionElement, option, q.correctAnswer);

            const img = document.createElement("img");
            img.src = `imagenes/${option}.jpg`;
            img.alt = option;
            optionElement.appendChild(img);

            optionsContainer.appendChild(optionElement);
        });

        questionContainer.appendChild(optionsContainer);

        // Agregar el botón revisar
        const reviewButton = document.createElement("button");
        reviewButton.textContent = "Check";
        reviewButton.classList.add("btn-revise");
        reviewButton.onclick = () => reviewAnswer(optionsContainer, q.correctAnswer);

        questionContainer.appendChild(reviewButton);

        quizContainer.appendChild(questionContainer);
    });
}

// Función para seleccionar la opción
function selectOption(element, selectedOption, correctAnswer) {
    // Remover selección previa en todas las opciones del contenedor de la pregunta actual
    const options = element.parentNode.children;
    for (let opt of options) {
        opt.classList.remove("selected");
    }

    // Agregar selección a la opción seleccionada
    element.classList.add("selected");
    element.dataset.selected = selectedOption; // Guardamos la opción seleccionada
}

// Función para revisar la respuesta después de presionar el botón "Revisar"
function reviewAnswer(optionsContainer, correctAnswer) {
    const options = optionsContainer.children;
    let selectedOption = null;

    // Buscar la opción seleccionada
    for (let option of options) {
        if (option.classList.contains("selected")) {
            selectedOption = option.dataset.selected;
            break;
        }
    }

    if (selectedOption) {
        // Verificar si la opción seleccionada es la correcta
        optionsContainer.querySelectorAll('.option').forEach(opt => {
            if (opt.dataset.selected === correctAnswer) {
                opt.classList.add("correct");
            } else {
                opt.classList.add("incorrect");
            }
        });
    }
}

// Cargar el quiz cuando se cargue la página
window.onload = loadQuiz;
