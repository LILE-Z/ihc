document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[data-animal]');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const correctLetter = input.dataset.correct;
            const animal = input.dataset.animal;
            const listItem = document.getElementById();

            if (input.value.toLowerCase() === correctLetter) {
                input.classList.remove('is-invalid');
                listItem.classList.remove('text-danger');
            } else {
                input.classList.add('is-invalid');
                listItem.classList.add('text-danger');
            }
        });
    });
});

