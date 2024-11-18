let interactions = [];
let completed = 0;

// Solo cuenta las partes correctas
const totalParts = document.querySelectorAll('.overlay-div[onclick*="true"]').length;

function handleClick(element, animal, part, isCorrect) {
    if (isCorrect) {
        if (!element.classList.contains('highlight')) {
            element.classList.add('highlight');
            completed++;
            interactions.push({ animal, part, result: 'correct' });
        }
    } else {
        element.classList.add('shake');
        interactions.push({ animal, part, result: 'incorrect' });
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    checkCompletion();
}

function checkCompletion() {
    if (completed === totalParts) {
        showModal();
    }
}

function showModal() {
    const modal = document.getElementById('completionModal');
    modal.style.display = 'block'; // Mostrar el modal
}

document.getElementById('submitActivity').addEventListener('click', () => {
    const prompt = interactions.map(
        (interaction) =>
            `Animal: ${interaction.animal}, Parte: ${interaction.part}, Resultado: ${interaction.result}`
    ).join('\n');

    // Enviar el prompt al servidor
    fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Prompt enviado a Gemini');
                window.location.href = '/pages/ai.html'; // Redirigir al formato diseñado de ai.html
            } else {
                console.error('Error al enviar el prompt');
            }
        })
        .catch((error) => console.error('Error:', error));
});

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('completionModal');
    modal.style.display = 'none';
}
