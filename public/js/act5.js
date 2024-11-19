let interactions = [];
const animals = ["horse", "lamb", "snake", "dog", "cat", "duck", "pig"];
let shuffledAnimals = [];
let currentAnimalIndex = 0;

// Función para mezclar los animales aleatoriamente
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateNewAnimal() {
    if (currentAnimalIndex < shuffledAnimals.length) {
        const targetAnimal = shuffledAnimals[currentAnimalIndex];
        document.getElementById("targetAnimal").innerText = `Select the correct animal: ${capitalize(targetAnimal)}`;
    } else {
        showCompletionModal();
    }
}

function handleAnimalClick(event) {
    const selectedAnimal = event.target.getAttribute("data-animal");
    const correctAnimal = shuffledAnimals[currentAnimalIndex];

    interactions.push({
        target: correctAnimal,
        selected: selectedAnimal,
        result: selectedAnimal === correctAnimal ? "Correct ✅" : "Incorrect ❌",
    });

    if (selectedAnimal === correctAnimal) {
        event.target.style.borderColor = "green";
    } else {
        event.target.style.borderColor = "red";
    }

    currentAnimalIndex++;
    generateNewAnimal();
}

function showCompletionModal() {
    const modal = document.getElementById("completionModal");
    const message = document.getElementById("modalMessage");

    message.textContent = "You have completed the activity! Sending results to AI...";
    modal.style.display = "block";
}

document.getElementById("submitActivity").addEventListener("click", () => {
    const prompt = `Activity: Animal Bingo\n\nResults:\n` +
        interactions
            .map((interaction, index) => {
                return `${index + 1}. Target: ${capitalize(interaction.target)}, Selected: ${capitalize(interaction.selected)}, Result: ${interaction.result}`;
            })
            .join("\n");

    fetch("/setPrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    })
        .then((response) => {
            if (response.ok) {
                window.location.href = "/pages/ai.html";
            } else {
                console.error("Error sending the prompt.");
            }
        })
        .catch((error) => console.error("Error:", error));
});

document.querySelectorAll(".animal-img").forEach((img) => {
    img.addEventListener("click", handleAnimalClick);
});

// Capitalizar la primera letra de una palabra
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Mezclar los animales antes de comenzar la actividad
shuffledAnimals = shuffleArray([...animals]);
generateNewAnimal();
