document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const wheelImage = document.getElementById('wheel-image');
    const spinButton = document.getElementById('spin-button');
    const videoContainer = document.getElementById('video-container');
    const prizeVideo = document.getElementById('prize-video');
    const prizeReveal = document.getElementById('prize-reveal');
    const prizeText = document.getElementById('prize-text');
    const prizeImage = document.getElementById('prize-image');
    const claimButton = document.getElementById('claim-button');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Track the last selected prize index to avoid repetition
    let lastPrizeIndex = -1;
    
    // Add click event listeners
    spinButton.addEventListener('click', handleSpin);
    claimButton.addEventListener('click', () => {
        // Hide the prize reveal when claim button is clicked
        prizeReveal.classList.remove('active');
        
        // Check if this is a "try again" spin
        if (claimButton.textContent === 'SPIN AGAIN') {
            // Trigger the spin button click immediately
            handleSpin();
        } else {
            // For regular prizes, just re-enable the spin button and show UI elements
            spinButton.disabled = false;
            spinButton.classList.remove('disabled');
            spinButton.style.opacity = '1';
            spinButton.style.display = 'block';
            
            // Show the title again
            const titleContainer = document.querySelector('.title-container');
            titleContainer.style.opacity = '1';
            titleContainer.style.display = 'block';
        }
    });

    // Prize configuration with equal probabilities
    const prizes = [
        { name: "Metashot Bat", probability: 12.5, videoSrc: "assets/gift-1.mp4", imageSrc: "assets/gift-1.jpg" },
        { name: "Prize 2", probability: 12.5, videoSrc: "assets/gift-2.mp4", imageSrc: "assets/gift-2.jpg" },
        { name: "Prize 3", probability: 12.5, videoSrc: "assets/gift-3.mp4", imageSrc: "assets/gift-3.jpg" },
        { name: "Prize 4", probability: 12.5, videoSrc: "assets/gift-4.mp4", imageSrc: "assets/gift-4.jpg" },
        { name: "Prize 5", probability: 12.5, videoSrc: "assets/gift-5.mp4", imageSrc: "assets/gift-5.jpg" },
        { name: "Prize 6", probability: 12.5, videoSrc: "assets/gift-6.mp4", imageSrc: "assets/gift-6.jpg" },
        { name: "Prize 7", probability: 12.5, videoSrc: "assets/gift-7.mp4", imageSrc: "assets/gift-7.jpg" },
        { name: "Chance to Spin Again", probability: 12.5, videoSrc: "assets/gift-8.mp4", imageSrc: "assets/gift-8.jpg", isTryAgain: true }
    ];

    // Generate a queue of prizes based on their probabilities
    let prizeQueue = [];
    
    // Function to generate the prize queue
    function generatePrizeQueue() {
        const queueSize = 100; // Size of the queue to pre-generate
        const queue = [];
        
        // First, ensure all 8 videos play once in a random order
        const initialSet = [...Array(prizes.length).keys()]; // [0,1,2,3,4,5,6,7]
        
        // Shuffle the initial set using Fisher-Yates algorithm
        for (let i = initialSet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialSet[i], initialSet[j]] = [initialSet[j], initialSet[i]];
        }
        
        // Add the shuffled set to the queue
        queue.push(...initialSet);
        
        // Fill the rest of the queue with random selections
        while (queue.length < queueSize) {
            // Create another complete set of all prizes in random order
            const nextSet = [...Array(prizes.length).keys()];
            
            // Shuffle this set
            for (let i = nextSet.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nextSet[i], nextSet[j]] = [nextSet[j], nextSet[i]];
            }
            
            // Add this set to the queue
            queue.push(...nextSet);
        }
        
        // Trim to the desired queue size
        return queue.slice(0, queueSize);
    }
    
    // Initialize the prize queue
    prizeQueue = generatePrizeQueue();
    
    // Function to select a prize based on the queue and avoid repetition
    function selectPrize() {
        if (prizeQueue.length === 0) {
            // Regenerate the queue if it's empty
            prizeQueue = generatePrizeQueue();
        }
        
        // Get the next prize index from the queue
        let selectedIndex = prizeQueue.shift();
        
        // Try to avoid repetition by selecting a different prize if possible
        if (selectedIndex === lastPrizeIndex && prizeQueue.length > 0) {
            // Put the current prize back in the queue
            prizeQueue.push(selectedIndex);
            // Get the next prize instead
            selectedIndex = prizeQueue.shift();
        }
        
        // Update the last selected prize index
        lastPrizeIndex = selectedIndex;
        
        return prizes[selectedIndex];
    }

    // Function to handle spin button click
    function handleSpin() {
        // Disable spin button
        spinButton.disabled = true;
        spinButton.classList.add('disabled');
        
        // Fade out title and spin button
        const titleContainer = document.querySelector('.title-container');
        titleContainer.style.opacity = '0';
        spinButton.style.opacity = '0';
        
        // Add wheel zoom effect
        wheelImage.classList.add('wheel-zoom');
        
        // Select a prize from the queue
        const prize = selectPrize();
        
        // Wait for fade-out to complete before hiding elements
        setTimeout(() => {
            titleContainer.style.display = 'none';
            spinButton.style.display = 'none';
            
            // Wait a bit more before showing the video
            setTimeout(() => {
                showPrize(prize);
            }, 500);
        }, 800);
    }
    
    // Function to show the prize
    function showPrize(prize) {
        // Always use video 1 regardless of the prize selected
        prizeVideo.src = "assets/gift-1.mp4";
        prizeVideo.load(); // Force load the video
        
        // Add a fade-out effect to the wheel
        wheelImage.classList.add('wheel-fade-out');
        
        // When the video ends, show the prize reveal
        prizeVideo.onended = () => {
            skipToReveal(prize);
        };
        
        // Wait for wheel fade-out before showing video
         setTimeout(() => {
             // Hide wheel and show video container with transition
             wheelImage.style.visibility = 'hidden';
             videoContainer.classList.remove('hidden');
             videoContainer.classList.add('visible');
             
             // Try to play the video
             const playPromise = prizeVideo.play();
             
             // Handle play promise
             if (playPromise !== undefined) {
                 playPromise.then(() => {
                     // Video playback started successfully
                     // Hide loading overlay if it was shown
                     loadingOverlay.classList.remove('active');
                     loadingOverlay.classList.add('hidden');
                 }).catch(error => {
                     // Auto-play was prevented or other error
                     console.log('Video play error:', error);
                     // Hide loading overlay
                     loadingOverlay.classList.remove('active');
                     loadingOverlay.classList.add('hidden');
                     
                     // Skip to prize reveal if video can't play
                     skipToReveal(prize);
                 });
             }
         }, 800); // Wait for wheel fade-out animation
        
        // Handle video loading error
        prizeVideo.onerror = () => {
            // Skip to prize reveal if video can't load
            skipToReveal(prize);
        };
    }
    
    // Function to skip video and show prize reveal directly
    function skipToReveal(prize) {
        // Hide video container
        videoContainer.classList.remove('visible');
        videoContainer.classList.add('hidden');
        
        // Restore wheel visibility
        wheelImage.style.visibility = 'visible';
        wheelImage.classList.remove('wheel-zoom');
        wheelImage.classList.remove('wheel-fade-out');
        
        // Always use prize 1 (Metashot Bat) for the reveal
        const prize1 = prizes[0];
        prizeText.textContent = prize1.name;
        prizeImage.src = prize1.imageSrc;
        
        // Show the prize reveal
        prizeReveal.classList.add('active');
        
        // Always use the regular heading (not "Spin Again")
        const headingElement = document.querySelector('.prize-content h2');
        headingElement.textContent = 'CONGRATULATIONS!';
        
        // Set claim button text to CLAIM NOW
        claimButton.textContent = 'CLAIM NOW';
        
        // Always trigger confetti effect
        triggerConfetti();
    }

    // Function to trigger confetti effect
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // We've already added the claim button event listener at the top of the file
     // No additional event listeners needed here
});