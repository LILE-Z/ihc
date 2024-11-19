let interactions = [];
let completedImages = new Set(); // Almacena imágenes completadas
let score = 3;

document.addEventListener('DOMContentLoaded', () => {
    updateScoreDisplay(); // Inicializa el contador de puntos en la interfaz
});

const totalImages = document.querySelectorAll('.animal-container').length; // Total de imágenes

function handleClick(element, animal, part, isCorrect) { const parentContainer = element.closest('.animal-container');
    const imageId = parentContainer.querySelector('img').id; // Identificar la imagen

    if (isCorrect && !completedImages.has(imageId)) {
        completedImages.add(imageId); // Marcar la imagen como completada
        element.style.backgroundColor = "rgba(50, 205, 50, 0.5)"; // Cambiar el color del div a verde
        element.style.borderRadius = "5px"; // Opcional: agregar bordes suaves
        interactions.push({ animal, part, result: 'correct', image: imageId });
    } else if (!isCorrect) {
        deductPoint();
        const imgParent = parentContainer.querySelector('img');
        imgParent.classList.add('shake');
        interactions.push({
            animal,
            part,
            result: 'incorrect',
            image: imageId,
            expected: part,
        });
        setTimeout(() => {
            imgParent.classList.remove('shake');
        }, 500);
    }

    checkCompletion();
}


document.querySelectorAll('.animal-container img').forEach((img) => {
    img.addEventListener('click', (e) => {
        if (!e.target.classList.contains('overlay-div')) {
            deductPoint();
            const imgParent = e.target;
            imgParent.classList.add('shake');
            setTimeout(() => {
                imgParent.classList.remove('shake');
            }, 500);
        }
    });
});

function deductPoint() {
    if (score > 0) score--;
    updateScoreDisplay();

    if (score === 0) {
        showModal('Oops! You ran out of points. Try again.');
    }
}

function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = score;
}

function checkCompletion() {
    if (completedImages.size === totalImages) {
        showModal('Congratulations! You completed the activity successfully.');
    }
}

function showModal(message) {
    const modal = document.getElementById('completionModal');
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = message;
    modal.style.display = 'block';
}

document.getElementById('submitActivity').addEventListener('click', () => {
    // Introducción al prompt
    const introduction = `
    Activity Name: Find the Animal Parts
    Description: This activity challenges the user to identify and click on specific parts of animals. 
    Each animal has a corresponding part to find, such as wings, legs, or fur. The user starts with 3 points, 
    and points are deducted for incorrect selections. The goal is to complete the activity by finding at least one correct part for each animal.
    `;

    // Generación del detalle del prompt
    const promptDetails = interactions.map((interaction) => {
        if (interaction.result === 'correct') {
            return `Image: ${interaction.image}, Animal: ${interaction.animal}, Part: ${interaction.part}, Result: ${interaction.result}`;
        } else {
            return `Image: ${interaction.image}, Animal: ${interaction.animal}, Part: ${interaction.part}, Result: ${interaction.result}, Expected: ${interaction.expected}`;
        }
    }).join('\n');

    // Concatenar introducción y detalles
    const fullPrompt = `${introduction}\n\nResults:\n${promptDetails}`;

    // Enviar el prompt al servidor
    fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Prompt sent to Gemini');
                window.location.href = '/pages/ai.html';
            } else {
                console.error('Error sending the prompt');
            }
        })
        .catch((error) => console.error('Error:', error));
});

