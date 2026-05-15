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

    // Prize configuration, now all equal chance!
    const prizes = [
        { name: "MetaShot", videoSrc: "assets/gift-1.mp4", imageSrc: "assets/gift-1.jpg" },
        { name: "Resume Make", videoSrc: "assets/gift-2.mp4", imageSrc: "assets/gift-2.jpg" },
        { name: "Techpath Explorer", videoSrc: "assets/gift-3.mp4", imageSrc: "assets/gift-3.jpg" },
        { name: "Super Bounce 20% Discount", videoSrc: "assets/gift-4.mp4", imageSrc: "assets/gift-4.jpg" },
        { name: "FangTech", videoSrc: "assets/gift-5.mp4", imageSrc: "assets/gift-5.jpg" },
        { name: "Crazy Game", videoSrc: "assets/gift-6.mp4", imageSrc: "assets/gift-6.jpg" },
        { name: "Music Concert", videoSrc: "assets/gift-7.mp4", imageSrc: "assets/gift-7.jpg" },
        { name: "Spin Again", videoSrc: "assets/gift-8.mp4", imageSrc: "assets/gift-8.jpg", isTryAgain: true }
    ];

    // Function to select a prize at random, avoid immediate repeats
    function selectPrize() {
        let selectedIndex;
        do {
            selectedIndex = Math.floor(Math.random() * prizes.length);
        } while (selectedIndex === lastPrizeIndex && prizes.length > 1);
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
        
        // Select a prize
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
        // Set up the video but don't show it yet
        prizeVideo.src = prize.videoSrc;
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
        
        // Set prize details
        prizeText.textContent = prize.name;
        prizeImage.src = prize.imageSrc;
        
        // Show the prize reveal
        prizeReveal.classList.add('active');
        
        // Check if this is the "Try Again" prize
        const headingElement = document.querySelector('.prize-content h2');
        if (prize.isTryAgain) {
            // Change the congratulations text
            headingElement.textContent = 'Spin Again!';
            headingElement.classList.add('try-again');
            claimButton.textContent = 'SPIN AGAIN';
        } else {
            // Reset to default text for regular prizes
            headingElement.textContent = 'CONGRATULATIONS!';
            headingElement.classList.remove('try-again');
            claimButton.textContent = 'CLAIM NOW';
            triggerConfetti();
        }
    }

    // Function to trigger confetti effect
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
});
