// Game State
const gameState = {
    playerName: '',
    currentScreen: 'start',
    dialogStep: 0,
    gregoryFound: false
};

// Audio Elements
const audio = {
    startJazz: document.getElementById('startJazz'),
    mainJazz: document.getElementById('mainJazz'),
    heartbeat: document.getElementById('heartbeat'),
    sadJazz: document.getElementById('sadJazz'),
    celebrationMusic: document.getElementById('celebrationMusic'),
    buttonClick: document.getElementById('buttonClick')
};

// Screen Elements
const screens = {
    start: document.getElementById('startScreen'),
    name: document.getElementById('nameScreen'),
    room: document.getElementById('roomScreen'),
    dialog: document.getElementById('dialogScreen'),
    sadEnding: document.getElementById('sadEndingScreen'),
    happyEnding: document.getElementById('happyEndingScreen'),
    gregory: document.getElementById('gregoryScreen'),
    bonusScene: document.getElementById('bonusScene')
};

// Dialog Messages
const dialogMessages = [
    `Hey {{NAME}}... I've been wanting to tell you something for a while now...`,
    `Every moment we spend together makes my heart skip a beat.`,
    `You're the most amazing person I've ever met, and I can't imagine my days without you.`,
    `So... I have an important question to ask you...`
];

const yesResponseMessages = [
    `Really?! Oh my gosh, {{NAME}}!`,
    `You have no idea how happy you've made me!`,
    `I have something special for you...`
];

const noResponseMessages = [
    `Oh... I see...`,
    `I understand, {{NAME}}...`,
    `I guess this is goodbye then...`
];

let currentDialogIndex = 0;
let dialogMode = 'initial'; // 'initial', 'yesResponse', 'noResponse'
let isMuted = false;
let collapseTimeout = null;
let isManuallyControlled = false;

// Music Player Elements
const musicPlayer = {
    currentSongDisplay: null,
    muteButton: null,
    container: null,
    toggleButton: null
};

// Song name mapping
const songNames = {
    startJazz: 'Start Menu Theme',
    mainJazz: 'Main Theme',
    heartbeat: 'Heartbeat',
    sadJazz: 'Sad Theme',
    celebrationMusic: 'Celebration Theme'
};

// Utility Functions
function toggleMusicPlayer() {
    if (musicPlayer.container) {
        const isCollapsed = musicPlayer.container.classList.contains('collapsed');
        
        if (isCollapsed) {
            musicPlayer.container.classList.remove('collapsed');
            isManuallyControlled = false; // Allow auto-collapse again
            
            // Set auto-collapse timer
            if (collapseTimeout) {
                clearTimeout(collapseTimeout);
            }
            collapseTimeout = setTimeout(() => {
                if (!isManuallyControlled) {
                    musicPlayer.container.classList.add('collapsed');
                }
            }, 3000);
        } else {
            musicPlayer.container.classList.add('collapsed');
            isManuallyControlled = true; // Prevent auto-collapse
            if (collapseTimeout) {
                clearTimeout(collapseTimeout);
            }
        }
    }
}

function showMusicPlayer() {
    if (musicPlayer.container && !isManuallyControlled) {
        musicPlayer.container.classList.remove('collapsed');
        
        // Clear existing timeout
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
        }
        
        // Auto-collapse after 3 seconds only if not manually controlled
        collapseTimeout = setTimeout(() => {
            if (!isManuallyControlled) {
                musicPlayer.container.classList.add('collapsed');
            }
        }, 3000);
    }
}

function updateSongDisplay(songKey) {
    if (musicPlayer.currentSongDisplay) {
        const songName = songNames[songKey] || 'Unknown';
        musicPlayer.currentSongDisplay.textContent = songName;
        showMusicPlayer();
    }
}

let pausedAudio = null;

function stopAllAudio() {
    Object.keys(audio).forEach(key => {
        // Don't stop button click sound
        if (key !== 'buttonClick' && audio[key]) {
            audio[key].pause();
            audio[key].currentTime = 0;
        }
    });
}

function pauseCurrentAudio() {
    // Find and pause currently playing audio
    pausedAudio = null;
    Object.keys(audio).forEach(key => {
        if (key !== 'buttonClick' && audio[key] && !audio[key].paused) {
            audio[key].pause();
            pausedAudio = audio[key];
        }
    });
}

function resumePausedAudio() {
    if (pausedAudio && pausedAudio.paused) {
        pausedAudio.play().catch(err => console.log('Resume audio failed:', err));
    }
}

function playAudio(audioElement) {
    if (!audioElement) return;
    
    // Find the key name for this audio element
    const audioKey = Object.keys(audio).find(key => audio[key] === audioElement);
    if (audioKey) {
        updateSongDisplay(audioKey);
    }
    
    audioElement.currentTime = 0;
    
    // Apply muted state with 60% base volume
    if (isMuted) {
        audioElement.volume = 0;
    } else {
        audioElement.volume = 0.6; // 60% volume for all music
    }
    
    audioElement.play().catch(err => console.log('Audio play failed:', err));
}

function playButtonSound() {
    if (audio.buttonClick) {
        audio.buttonClick.currentTime = 0;
        audio.buttonClick.volume = 1; // 100% volume for button sound
        audio.buttonClick.play().catch(err => console.log('Button sound failed:', err));
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteButton = musicPlayer.muteButton;
    const muteIcon = muteButton.querySelector('.mute-icon');
    
    if (isMuted) {
        // Mute all audio except button sounds
        Object.keys(audio).forEach(key => {
            if (key !== 'buttonClick' && audio[key]) {
                audio[key].volume = 0;
            }
        });
        muteButton.classList.add('muted');
        muteIcon.textContent = '✕';
    } else {
        // Unmute all audio to 60%
        Object.keys(audio).forEach(key => {
            if (key !== 'buttonClick' && audio[key]) {
                audio[key].volume = 0.6;
            }
        });
        muteButton.classList.remove('muted');
        muteIcon.textContent = '♫';
    }
}

function switchScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    
    // Show target screen
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        gameState.currentScreen = screenName;
    }
}

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    // Replace the placeholder with actual name
    const processedText = text.replace(/\{\{NAME\}\}/g, gameState.playerName);
    
    return new Promise((resolve) => {
        function type() {
            if (i < processedText.length) {
                element.textContent += processedText.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

function typeWriterSlow(element, text, speed = 120) {
    let i = 0;
    element.textContent = '';
    
    return new Promise((resolve) => {
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Start Screen
function initStartScreen() {
    const startButton = document.getElementById('startButton');
    
    // Play start jazz music
    playAudio(audio.startJazz);
    
    // Click handler
    startButton.addEventListener('click', startGame);
    
    // Spacebar handler
    document.addEventListener('keydown', function spaceHandler(e) {
        if (e.code === 'Space' && gameState.currentScreen === 'start') {
            e.preventDefault();
            startGame();
            document.removeEventListener('keydown', spaceHandler);
        }
    });
}

function startGame() {
    stopAllAudio();
    switchScreen('name');
    
    // Focus on input after transition
    setTimeout(() => {
        document.getElementById('nameInput').focus();
    }, 500);
}

// Name Entry Screen
function initNameScreen() {
    const nameInput = document.getElementById('nameInput');
    const enterButton = document.getElementById('enterButton');
    
    enterButton.addEventListener('click', submitName);
    
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });
}

function submitName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name === '') {
        // Add error class for visual feedback
        nameInput.classList.add('error');
        
        // Remove error class after 3 seconds
        setTimeout(() => {
            nameInput.classList.remove('error');
        }, 3000);
        
        return;
    }
    
    gameState.playerName = name;
    
    // Start main jazz after name submission
    setTimeout(() => {
        playAudio(audio.mainJazz);
    }, 500);
    
    switchScreen('room');
}

// Room Screen
function initRoomScreen() {
    const clickableObjects = document.querySelectorAll('.clickable-object');
    
    clickableObjects.forEach(obj => {
        obj.addEventListener('click', () => {
            const objectType = obj.getAttribute('data-object');
            handleObjectClick(objectType);
        });
    });
}

function handleObjectClick(objectType) {
    if (objectType === 'imms') {
        // Start the dialog sequence
        startDialog();
    } else if (objectType === 'picture') {
        // Show the picture frame in focus view
        showItemFocus('images/picture-frame.png', 'A cherished photo of you and Imms together... A memory captured forever.');
    } else if (objectType === 'plushies') {
        // Show the plushies in focus view
        showItemFocus('images/plushies.png', 'A blue whale with a white belly and a purple crochet octopus... Handmade gifts you crafted with love for Imms!');
    } else if (objectType === 'gregory') {
        // Show Gregory video in focus view - Easter egg!
        gameState.gregoryFound = true;
        showGregoryVideo();
    } else {
        // Optional: Add small interactions for other objects
        console.log(`Clicked on ${objectType}`);
    }
}

function showItemFocus(imageSrc, message) {
    const overlay = document.getElementById('itemFocusOverlay');
    const focusedItem = document.getElementById('focusedItem');
    const focusMessage = document.getElementById('focusMessage');
    
    focusedItem.src = imageSrc;
    focusMessage.textContent = message;
    overlay.classList.remove('hidden');
}

function showGregoryVideo() {
    // Pause current background music
    pauseCurrentAudio();
    
    // Create fullscreen video overlay
    let videoOverlay = document.getElementById('gregoryVideoOverlay');
    if (!videoOverlay) {
        videoOverlay = document.createElement('div');
        videoOverlay.id = 'gregoryVideoOverlay';
        videoOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const videoElement = document.createElement('video');
        videoElement.id = 'gregoryFullscreenVideo';
        videoElement.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.src = 'videos/gregory-meme.mp4';
        
        videoOverlay.appendChild(videoElement);
        document.body.appendChild(videoOverlay);
        
        // When video ends, close overlay and resume music
        videoElement.onended = () => {
            closeGregoryVideo();
        };
        
        // Allow clicking outside video to close
        videoOverlay.onclick = (e) => {
            if (e.target === videoOverlay) {
                closeGregoryVideo();
            }
        };
    } else {
        videoOverlay.style.display = 'flex';
        const videoElement = document.getElementById('gregoryFullscreenVideo');
        videoElement.currentTime = 0;
        videoElement.play().catch(err => console.log('Video play failed:', err));
    }
}

function closeGregoryVideo() {
    const videoOverlay = document.getElementById('gregoryVideoOverlay');
    if (videoOverlay) {
        const videoElement = document.getElementById('gregoryFullscreenVideo');
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
        }
        videoOverlay.style.display = 'none';
    }
    
    // Resume background music
    resumePausedAudio();
}

function hideItemFocus() {
    const overlay = document.getElementById('itemFocusOverlay');
    overlay.classList.add('hidden');
}

function showRoomMessage(message) {
    const roomTitle = document.querySelector('.room-title');
    const originalText = roomTitle.textContent;
    
    roomTitle.textContent = message;
    roomTitle.style.fontSize = '10px';
    
    setTimeout(() => {
        roomTitle.textContent = originalText;
        roomTitle.style.fontSize = '12px';
    }, 2500);
}

// Dialog Screen
function startDialog() {
    switchScreen('dialog');
    currentDialogIndex = 0;
    showNextDialog();
}

function showNextDialog() {
    const dialogText = document.getElementById('dialogText');
    const continueButton = document.getElementById('continueButton');
    
    let messages = dialogMessages;
    if (dialogMode === 'yesResponse') {
        messages = yesResponseMessages;
    } else if (dialogMode === 'noResponse') {
        messages = noResponseMessages;
    }
    
    if (currentDialogIndex < messages.length) {
        const message = messages[currentDialogIndex];
        
        typeWriter(dialogText, message, 30);
        currentDialogIndex++;
        
        // Show continue button after typing
        continueButton.style.visibility = 'visible';
    } else {
        if (dialogMode === 'initial') {
            // All initial dialogs shown, show the choice modal
            showChoiceModal();
        } else if (dialogMode === 'yesResponse') {
            // Yes response dialogs done, go to happy ending
            proceedToHappyEnding();
        } else if (dialogMode === 'noResponse') {
            // No response dialogs done, go to sad ending
            proceedToSadEnding();
        }
    }
}

function initDialogScreen() {
    const continueButton = document.getElementById('continueButton');
    
    continueButton.addEventListener('click', showNextDialog);
}

// Choice Modal
function showChoiceModal() {
    const modal = document.getElementById('choiceModal');
    const choiceQuestion = document.getElementById('choiceQuestion');
    
    // Stop main jazz and start heartbeat
    stopAllAudio();
    playAudio(audio.heartbeat);
    
    // Update question with player name
    choiceQuestion.textContent = `${gameState.playerName}, will you be my Valentine?`;
    
    modal.classList.add('active');
}

function initChoiceModal() {
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const modal = document.getElementById('choiceModal');
    
    yesButton.addEventListener('click', () => {
        modal.classList.remove('active');
        handleYesChoice();
    });
    
    noButton.addEventListener('click', () => {
        modal.classList.remove('active');
        handleNoChoice();
    });
}

function handleYesChoice() {
    stopAllAudio();
    playAudio(audio.mainJazz);
    
    // Reset for yes response dialog
    currentDialogIndex = 0;
    dialogMode = 'yesResponse';
    
    // Stay on dialog screen and continue with yes responses
    showNextDialog();
}

function proceedToHappyEnding() {
    stopAllAudio();
    playAudio(audio.celebrationMusic);
    
    switchScreen('happyEnding');
    
    // Start the happy ending sequence
    startHappyEndingSequence();
}

function handleNoChoice() {
    stopAllAudio();
    playAudio(audio.sadJazz);
    
    // Change character to sad version
    const immsDialog = document.getElementById('immsDialog');
    immsDialog.src = 'images/imms-character-sad.png';
    
    // Reset for no response dialog
    currentDialogIndex = 0;
    dialogMode = 'noResponse';
    
    // Stay on dialog screen and continue with sad responses
    showNextDialog();
}

function proceedToSadEnding() {
    switchScreen('sadEnding');
    
    // Start the sad ending sequence
    startSadEndingSequence();
}

function startHappyEndingSequence() {
    const slideshow1 = document.getElementById('slideshow1');
    const slideshow2 = document.getElementById('slideshow2');
    const celebrationImage = document.getElementById('celebrationImage');
    const textContainer = document.getElementById('happyTextContainer');
    const typedText = document.getElementById('happyTypedText');
    const goodEndingText = document.getElementById('goodEndingText');
    
    // Reset all elements
    celebrationImage.classList.remove('show', 'fade-out');
    celebrationImage.classList.add('hidden');
    textContainer.classList.add('hidden');
    textContainer.classList.remove('fade-in', 'fade-out');
    goodEndingText.classList.add('hidden');
    goodEndingText.classList.remove('fade-in');
    typedText.textContent = '';
    slideshow1.classList.remove('hidden', 'fade-in', 'fade-out');
    slideshow2.classList.remove('hidden', 'fade-in', 'fade-out');
    
    // Show first image (flowers)
    slideshow1.classList.remove('hidden');
    slideshow1.classList.add('fade-in');
    
    // After 2.5 seconds, instantly swap to second image
    setTimeout(() => {
        slideshow1.classList.add('hidden');
        slideshow1.classList.remove('fade-in', 'fade-out');
        slideshow2.classList.remove('hidden');
        slideshow2.classList.add('fade-in');
        
        // After 2.5 seconds, fade out second image and show celebration image
        setTimeout(() => {
            slideshow2.classList.remove('fade-in');
            slideshow2.classList.add('fade-out');
            
            // After fade out completes, show celebration image
            setTimeout(() => {
                slideshow2.classList.add('hidden');
                celebrationImage.classList.remove('hidden');
                
                // Trigger fade-in
                setTimeout(() => {
                    celebrationImage.classList.add('show');
                    
                    // After 3 seconds, fade out celebration and show text
                    setTimeout(() => {
                        celebrationImage.classList.remove('show');
                        celebrationImage.classList.add('fade-out');
                        
                        // Wait for fade out
                        setTimeout(() => {
                            celebrationImage.classList.add('hidden');
                            
                            // Show and fade in the text container
                            textContainer.classList.remove('hidden');
                            textContainer.classList.add('fade-in');
                            
                            // Type out the sweet message
                            const message = `Thank you for being my Valentine, ${gameState.playerName}! 💕`;
                            typeWriterSlow(typedText, message, 100).then(() => {
                                // Wait 3 seconds then show GOOD ENDING
                                setTimeout(() => {
                                    textContainer.classList.remove('fade-in');
                                    textContainer.classList.add('fade-out');
                                    
                                    // After fade out completes
                                    setTimeout(() => {
                                        textContainer.classList.add('hidden');
                                        
                                        // Wait 1 second in black before showing GOOD ENDING
                                        setTimeout(() => {
                                            // Show "GOOD ENDING"
                                            goodEndingText.classList.remove('hidden');
                                            goodEndingText.classList.add('fade-in');
                                            
                                            // Wait 4 seconds then check for bonus
                                            setTimeout(() => {
                                                goodEndingText.classList.remove('fade-in');
                                                goodEndingText.classList.add('fade-out');
                                                
                                                // Check if Gregory was found
                                                setTimeout(() => {
                                                    if (gameState.gregoryFound) {
                                                        startBonusSequence();
                                                    } else {
                                                        restartGame();
                                                    }
                                                }, 2000);
                                            }, 4000);
                                        }, 1000);
                                    }, 2000);
                                }, 3000);
                            });
                        }, 2000);
                    }, 3000);
                }, 100);
            }, 1500);
        }, 2500);
    }, 2500);
}

function startBonusSequence() {
    // Switch to bonus scene
    switchScreen('bonusScene');
    
    const bonusUnlocked = document.getElementById('bonusUnlocked');
    const gregoryWatch = document.getElementById('gregoryWatch');
    const bonusDialogText = document.getElementById('bonusDialogText');
    
    // Reset elements
    bonusUnlocked.classList.remove('show', 'fade-out');
    bonusUnlocked.classList.add('hidden');
    gregoryWatch.classList.remove('show', 'fade-out');
    gregoryWatch.classList.add('hidden');
    bonusDialogText.textContent = '';
    
    // Wait 1 second in black, then show "Bonus Scene Unlocked"
    setTimeout(() => {
        bonusUnlocked.classList.remove('hidden');
        setTimeout(() => {
            bonusUnlocked.classList.add('show');
            
            // After 3 seconds, fade out
            setTimeout(() => {
                bonusUnlocked.classList.remove('show');
                bonusUnlocked.classList.add('fade-out');
                
                // After fade out, show Gregory watch image
                setTimeout(() => {
                    bonusUnlocked.classList.add('hidden');
                    gregoryWatch.classList.remove('hidden');
                    
                    setTimeout(() => {
                        gregoryWatch.classList.add('show');
                        
                        // Type out the message
                        const message = `Congratulations on finding Gregory the Grasshopper!\n\nThis is perhaps the funniest and most ridiculous meme I've ever seen...\n\nI can't believe this exists! 😂`;
                        typeWriter(bonusDialogText, message, 30).then(() => {
                            // Wait 5 seconds then fade out
                            setTimeout(() => {
                                gregoryWatch.classList.remove('show');
                                gregoryWatch.classList.add('fade-out');
                                
                                // After fade out, wait 1 second then restart
                                setTimeout(() => {
                                    setTimeout(() => {
                                        restartGame();
                                    }, 1000);
                                }, 2000);
                            }, 5000);
                        });
                    }, 100);
                }, 2000);
            }, 3000);
        }, 100);
    }, 1000);
}

function startSadEndingSequence() {
    const video = document.getElementById('sadBridgeVideo');
    const textContainer = document.getElementById('sadTextContainer');
    const typedText = document.getElementById('typedText');
    const badEndingText = document.getElementById('badEndingText');
    
    // Reset all elements
    video.classList.remove('fade-out');
    textContainer.classList.add('hidden');
    textContainer.classList.remove('fade-in', 'fade-out');
    badEndingText.classList.add('hidden');
    badEndingText.classList.remove('fade-in');
    typedText.textContent = '';
    
    // Play the video
    video.currentTime = 0;
    video.play().catch(err => console.log('Video play failed:', err));
    
    // When video ends
    video.onended = () => {
        // Fade out the video
        video.classList.add('fade-out');
        
        // Wait for video fade out to complete (2s)
        setTimeout(() => {
            // Show and fade in the text container
            textContainer.classList.remove('hidden');
            textContainer.classList.add('fade-in');
            
            // Type out the message with slower speed
            const message = "Sometimes love isn't meant to be...";
            typeWriterSlow(typedText, message, 120).then(() => {
                // Wait 4 seconds after typing completes
                setTimeout(() => {
                    // Fade out the text
                    textContainer.classList.remove('fade-in');
                    textContainer.classList.add('fade-out');
                    
                    // After fade out completes (2s)
                    setTimeout(() => {
                        textContainer.classList.add('hidden');
                        
                        // Wait 1 second in black before showing BAD ENDING
                        setTimeout(() => {
                            // Show "BAD ENDING"
                            badEndingText.classList.remove('hidden');
                            badEndingText.classList.add('fade-in');
                            
                            // Wait 4 seconds then restart
                            setTimeout(() => {
                                restartGame();
                            }, 4000);
                        }, 1000);
                    }, 2000);
                }, 4000);
            });
        }, 2000);
    };
}

function restartGame() {
    // Stop all audio
    stopAllAudio();
    
    // Reset game state
    gameState.playerName = '';
    gameState.currentScreen = 'start';
    gameState.dialogStep = 0;
    gameState.gregoryFound = false;
    currentDialogIndex = 0;
    
    // Reset name input
    document.getElementById('nameInput').value = '';
    
    // Reset sad ending video
    const sadVideo = document.getElementById('sadBridgeVideo');
    if (sadVideo) {
        sadVideo.pause();
        sadVideo.currentTime = 0;
        sadVideo.classList.remove('fade-out');
    }
    
    // Reset celebration image (no longer a video)
    const celebrationImage = document.getElementById('celebrationImage');
    if (celebrationImage) {
        celebrationImage.classList.remove('show', 'fade-out');
        celebrationImage.classList.add('hidden');
    }
    
    // Reset slideshow images
    const slideshow1 = document.getElementById('slideshow1');
    const slideshow2 = document.getElementById('slideshow2');
    slideshow1.classList.add('hidden');
    slideshow1.classList.remove('fade-in', 'fade-out');
    slideshow2.classList.add('hidden');
    slideshow2.classList.remove('fade-in', 'fade-out');
    
    // Reset gregory video
    const gregoryVideo = document.getElementById('gregoryVideo');
    if (gregoryVideo) {
        gregoryVideo.pause();
        gregoryVideo.currentTime = 0;
        gregoryVideo.classList.remove('fade-out');
    }
    
    // Hide all sad ending elements
    document.getElementById('sadTextContainer').classList.add('hidden');
    document.getElementById('sadTextContainer').classList.remove('fade-in', 'fade-out');
    document.getElementById('badEndingText').classList.add('hidden');
    document.getElementById('badEndingText').classList.remove('fade-in');
    document.getElementById('typedText').textContent = '';
    
    // Hide all happy ending elements
    document.getElementById('happyTextContainer').classList.add('hidden');
    document.getElementById('happyTextContainer').classList.remove('fade-in', 'fade-out');
    document.getElementById('happyTypedText').textContent = '';
    
    // Hide gregory ending elements
    document.getElementById('goodEndingText').classList.add('hidden');
    document.getElementById('goodEndingText').classList.remove('fade-in');
    
    // Reset bonus scene elements
    const bonusUnlocked = document.getElementById('bonusUnlocked');
    const gregoryWatch = document.getElementById('gregoryWatch');
    if (bonusUnlocked) {
        bonusUnlocked.classList.remove('show', 'fade-out');
        bonusUnlocked.classList.add('hidden');
    }
    if (gregoryWatch) {
        gregoryWatch.classList.remove('show', 'fade-out');
        gregoryWatch.classList.add('hidden');
    }
    const bonusDialogText = document.getElementById('bonusDialogText');
    if (bonusDialogText) {
        bonusDialogText.textContent = '';
    }
    
    // Return to start screen
    switchScreen('start');
    
    // Restart start music
    setTimeout(() => {
        playAudio(audio.startJazz);
    }, 500);
}

// Initialize Game
function initGame() {
    console.log('🎮 Valentine\'s Game Initialized!');
    
    // Initialize music player UI
    musicPlayer.container = document.getElementById('musicPlayer');
    musicPlayer.currentSongDisplay = document.getElementById('currentSong');
    musicPlayer.muteButton = document.getElementById('muteButton');
    musicPlayer.toggleButton = document.getElementById('togglePlayerButton');
    
    // Add mute button event listener
    musicPlayer.muteButton.addEventListener('click', () => {
        playButtonSound();
        toggleMute();
    });
    
    // Add toggle button event listener
    musicPlayer.toggleButton.addEventListener('click', () => {
        playButtonSound();
        toggleMusicPlayer();
    });
    
    // Initialize item focus overlay close button
    const closeFocusButton = document.getElementById('closeFocusButton');
    if (closeFocusButton) {
        closeFocusButton.addEventListener('click', () => {
            playButtonSound();
            hideItemFocus();
        });
    }
    
    // Add button click sound to all buttons
    document.querySelectorAll('button, .pixel-button').forEach(button => {
        button.addEventListener('click', () => {
            playButtonSound();
        });
    });
    
    // Show music player initially
    showMusicPlayer();
    
    initStartScreen();
    initNameScreen();
    initRoomScreen();
    initDialogScreen();
    initChoiceModal();
    
    // Set initial screen
    switchScreen('start');
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);

// Handle audio autoplay restrictions
document.addEventListener('click', function enableAudio() {
    Object.values(audio).forEach(sound => {
        if (sound) sound.load();
    });
    document.removeEventListener('click', enableAudio);
}, { once: true });
