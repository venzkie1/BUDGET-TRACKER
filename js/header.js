const header = document.querySelector('header');
const images = [
    'twenty.jpeg', 'fifty.jpg', 'oneHundred.jpg', 'twoHundred.jpg', 'fiveHundred.jpeg', 'thousand.jpg'
];

// Function to create a new falling image
function createFallingImage() {
    const img = document.createElement('img');
    img.src = '../images/' + images[Math.floor(Math.random() * images.length)];
    img.classList.add('rain-image');
    img.style.left = Math.random() * 100 + 'vw'; // Random horizontal position
    img.style.animationDuration = Math.random() * 3 + 6 + 's'; // Random speed

    header.appendChild(img);

    // Remove the image after the animation ends
    img.addEventListener('animationend', () => {
        img.remove();
    });
}

// Create multiple falling images
setInterval(createFallingImage, 1500); // Create a new image every 500ms