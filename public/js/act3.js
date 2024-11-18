let interactions = [];

// Selección de todas las imágenes
document.querySelectorAll('.img-fluid').forEach(img => {
    img.addEventListener('click', (event) => {
        const selectedAnimal = event.target.getAttribute('data-animal');
        const correctAnimal = 'snake';

        // Registrar interacción
        interactions.push({
            question: 'Who am I? I am green and have no legs.',
            selected: selectedAnimal,
            result: selectedAnimal === correctAnimal ? 'Correct ✅' : 'Incorrect ❌',
        });

        // Mostrar el modal con la retroalimentación
        showCompletionModal(
            selectedAnimal === correctAnimal ? 'Correct!' : 'Try Again',
            selectedAnimal === correctAnimal
                ? 'Great job! The snake is green and has no legs.'
                : 'That\'s not correct. Remember, I am green and have no legs.'
        );
    });
});

// Función para mostrar el modal
function showCompletionModal(title, message) {
    const modal = document.getElementById('completionModal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body p');

    // Actualizar contenido del modal
    modalTitle.textContent = title;
    modalBody.textContent = message;

    // Mostrar el modal
    modal.style.display = 'block';

    // Enviar resultados a la IA al cerrar el modal
    document.getElementById('submitActivity').addEventListener('click', sendResultsToGemini);
}

// Función para enviar resultados a la IA de Gemini
function sendResultsToGemini() {
    const prompt = `Activity: Circle the Right Picture\n\nResults:\n` +
        interactions
            .map((interaction, index) => {
                return `${index + 1}. Question: ${interaction.question}\nSelected: ${interaction.selected}\nResult: ${interaction.result}`;
            })
            .join('\n');

    fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/pages/ai.html';
            } else {
                console.error('Error sending prompt to Gemini');
            }
        })
        .catch(error => console.error('Error:', error));
}
