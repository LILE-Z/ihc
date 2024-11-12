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
            
            inputs.forEach(input => {
                if (input.value.toLowerCase() !== input.dataset.correct) {
                    allCorrect = false;
                } else {
                    correctCount++;
                }
            });

            const completionModalBody = document.querySelector('#completionModal .modal-body p');

            if (allCorrect) {
                completionModalBody.textContent = 'Congratulations! You\'ve completed the activity correctly!';
            } else {
                completionModalBody.textContent = `You got ${correctCount} out of ${inputs.length} correct. Keep trying!`;
            }

            document.getElementById('completionModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('completionModal').style.display = 'none';
        }
