let interactions = [];

document.getElementById('verifyAnswers').addEventListener('click', () => {
    const size = document.querySelector('input[name="size"]:checked');
    const covering = document.querySelector('input[name="covering"]:checked');
    const legs = document.querySelector('input[name="legs"]:checked');

    if (!size || !covering || !legs) {
        alert('Please select an answer for each question.');
        return;
    }

    // Respuestas correctas
    const correctAnswers = {
        size: 'small',
        covering: 'fur',
        legs: 'four',
    };

    let correctCount = 0;

    // Evaluar respuestas
    interactions = [
        {
            animal: 'dog',
            part: 'size',
            answer: size.value,
            result: size.value === correctAnswers.size ? '¡Correcto! ✅' : 'Incorrecto ❌',
        },
        {
            animal: 'dog',
            part: 'covering',
            answer: covering.value,
            result: covering.value === correctAnswers.covering ? '¡Correcto! ✅' : 'Incorrecto ❌',
        },
        {
            animal: 'dog',
            part: 'legs',
            answer: legs.value,
            result: legs.value === correctAnswers.legs ? '¡Correcto! ✅' : 'Incorrecto ❌',
        },
    ];

    correctCount = interactions.filter((i) => i.result.includes('✅')).length;

    // Mostrar el modal con el resultado
    const modal = document.getElementById('completionModal');
    const message = document.getElementById('modalMessage');

    if (correctCount === 3) {
        message.textContent = 'All answers are correct! Great job!';
    } else {
        message.textContent = `You got ${correctCount} out of 3 correct. Good effort!`;
    }

    modal.style.display = 'block';
});

document.getElementById('submitActivity').addEventListener('click', () => {
    const prompt = `The image represents a dog. The user completed the activity with the following answers:\n\n` +
        interactions
            .map((interaction, index) => {
                const partDescription = {
                    size: 'El tamaño del perro (small o big)',
                    covering: 'La cubierta del perro (feathers o fur)',
                    legs: 'El número de patas del perro (two o four)',
                };

                return `${index + 1}. **Parte:** ${partDescription[interaction.part]}\n**Respuesta:** ${interaction.answer}\n**Resultado:** ${interaction.result}`;
            })
            .join('\n\n');

    fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Prompt enviado a Gemini');
                window.location.href = '/pages/ai.html'; // Redirigir a la retroalimentación
            } else {
                console.error('Error al enviar el prompt');
            }
        })
        .catch((error) => console.error('Error:', error));
});
