document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[data-animal]');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const correctLetter = input.dataset.correct;
            const animal = input.dataset.animal;
            const listItem = document.getElementById(`list-${animal}`);

            if (input.value.toLowerCase() === correctLetter) {
                input.classList.remove('is-invalid');
            } else {
                input.classList.add('is-invalid');
                listItem.classList.add('text-danger');
            }

            const relatedInputs = document.querySelectorAll(`input[data-animal='${animal}']`);
            let allCorrect = Array.from(relatedInputs).every(relatedInput => relatedInput.value.toLowerCase() === relatedInput.dataset.correct);

            if (allCorrect) {
                listItem.classList.remove('text-danger');
            }

            // Check if all inputs are filled and evaluate
            if (Array.from(inputs).every(input => input.value !== '')) {
                showCompletionModal();
            }
        });
    });
});

function showCompletionModal() {
    const inputs = document.querySelectorAll('input[data-animal]');
    let allCorrect = true;
    let correctCount = 0;
    // const contexto = "Simula ser un profesor de inglés amable y motivador que revisa y da retroalimentación constructiva a un estudiante según su desempeño en una actividad que realizó. Te proporcionaré toda la información necesaria.Y recuerda usar Markdown y que el texto sea de almenos 1000 characters, ademas puedes usar emojis para hacerlo más amigable.";

    let report = "Activity Name: Animal Name Challenge!\n\nDescription: The activity consisted of guessing the correct letters for different animal names based on the images shown.\n\nResults:\n";

    inputs.forEach(input => {
        const animal = input.dataset.animal;
        const correctLetter = input.dataset.correct;
        const userAnswer = input.value.toLowerCase();

        if (userAnswer !== correctLetter) {
            allCorrect = false;
            report += `- Animal: ${animal}, Expected: ${correctLetter}, Your Answer: ${userAnswer} (Incorrect)\n`;
        } else {
            correctCount++;
            report += `- Animal: ${animal}, Expected: ${correctLetter}, Your Answer: ${userAnswer} (Correct)\n`;
        }
    });

    report += `\nYou got ${correctCount} out of ${inputs.length} correct.`;
    
    // Update the modal content
    const completionModalBody = document.querySelector('#completionModal .modal-body p');

    if (allCorrect) {
        completionModalBody.textContent = 'Congratulations! You\'ve completed the activity correctly!';
    } else {
        completionModalBody.textContent = `You got ${correctCount} out of ${inputs.length} correct. Keep trying!`;
    }

    // Send the report to the server
    sendPrompt(report);

    // Display the modal
    document.getElementById('completionModal').style.display = 'block';
}

async function sendPrompt(prompt) {
    // Send the prompt to the server with a POST request
    await fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
}

function closeModal() {
    document.getElementById('completionModal').style.display = 'none';
    // Redirect to ia.html after closing the modal
    window.location.href = 'ai.html';
}

