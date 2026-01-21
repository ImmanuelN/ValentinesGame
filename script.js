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
    intro: document.getElementById('introScreen'),
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

async function showNextDialog() {
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
        
        // Hide and disable continue button while typing
        continueButton.style.visibility = 'hidden';
        continueButton.disabled = true;
        
        // Wait for typing to complete
        await typeWriter(dialogText, message, 30);
        currentDialogIndex++;
        
        // Show and enable continue button after typing is done
        continueButton.style.visibility = 'visible';
        continueButton.disabled = false;
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
    if (musicPlayer.muteButton) {
        musicPlayer.muteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            playButtonSound();
            toggleMute();
        });
    }
    
    // Add toggle button event listener
    if (musicPlayer.toggleButton) {
        musicPlayer.toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            playButtonSound();
            toggleMusicPlayer();
        });
    }
    
    // Initialize item focus overlay close button
    const closeFocusButton = document.getElementById('closeFocusButton');
    if (closeFocusButton) {
        closeFocusButton.addEventListener('click', () => {
            playButtonSound();
            hideItemFocus();
        });
    }
    
    // Desktop icon event listener - single click to open
    const valentineGameIcon = document.getElementById('valentineGameIcon');
    if (valentineGameIcon) {
        valentineGameIcon.addEventListener('click', openGame);
    }
}

function openGame() {
    const desktop = document.getElementById('desktop');
    const gameWindow = document.getElementById('gameWindow');
    
    if (desktop && gameWindow) {
        desktop.classList.add('hidden');
        gameWindow.classList.remove('hidden');
        
        // Add button click sound to all game buttons
        document.querySelectorAll('#gameWindow button, #gameWindow .pixel-button').forEach(button => {
            button.addEventListener('click', () => {
                playButtonSound();
            });
        });
        
        // Initialize game components (but don't start music yet)
        initStartScreen();
        initNameScreen();
        initRoomScreen();
        initDialogScreen();
        initChoiceModal();
        
        // Start with intro sequence (music will start after intro)
        startIntroSequence();
    }
}

function startIntroSequence() {
    const introScreen = document.getElementById('introScreen');
    const studioLogo = document.getElementById('studioLogo');
    const presentsText = document.getElementById('presentsText');
    
    // Show intro screen
    switchScreen('intro');
    
    // Show studio logo with fade in
    setTimeout(() => {
        studioLogo.classList.remove('hidden');
        studioLogo.classList.add('fade-in');
        
        // After 2 seconds, fade out logo
        setTimeout(() => {
            studioLogo.classList.remove('fade-in');
            studioLogo.classList.add('fade-out');
            
            // Show "PRESENTS" text
            setTimeout(() => {
                studioLogo.classList.add('hidden');
                presentsText.classList.remove('hidden');
                presentsText.classList.add('fade-in');
                
                // After 2 seconds, fade out and go to start screen
                setTimeout(() => {
                    presentsText.classList.remove('fade-in');
                    presentsText.classList.add('fade-out');
                    
                    setTimeout(() => {
                        presentsText.classList.add('hidden');
                        // Start the game music and show start screen
                        playAudio(audio.startJazz);
                        showMusicPlayer();
                        switchScreen('start');
                    }, 1500);
                }, 2000);
            }, 1500);
        }, 2000);
    }, 500);
}

function updateTaskbarTime() {
    const taskbarTime = document.getElementById('taskbarTime');
    if (taskbarTime) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        taskbarTime.textContent = `${hours}:${minutes}`;
    }
}

// Initialize desktop when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Update taskbar time
    updateTaskbarTime();
    setInterval(updateTaskbarTime, 1000);
    
    // Initialize game components (but don't start)
    initGame();
    
    // Initialize desktop applications
    initDesktopApps();
});

// Desktop Applications
function initDesktopApps() {
    const gameCloseBtn = document.getElementById('windowCloseBtn');
    const explorerCloseBtn = document.getElementById('explorerCloseBtn');
    const viewerCloseBtn = document.getElementById('viewerCloseBtn');
    const backButton = document.getElementById('backButton');
    
    // Close buttons
    if (gameCloseBtn) {
        gameCloseBtn.addEventListener('click', closeGame);
    }
    if (explorerCloseBtn) {
        explorerCloseBtn.addEventListener('click', closeFileExplorer);
    }
    if (viewerCloseBtn) {
        viewerCloseBtn.addEventListener('click', closeMediaViewer);
    }
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }
    
    // Desktop icons - override only for non-game icons
    const myFilesIcon = document.querySelectorAll('.desktop-icon')[1];
    const musicIcon = document.querySelectorAll('.desktop-icon')[2];
    const photosIcon = document.querySelectorAll('.desktop-icon')[3];
    const videosIcon = document.querySelectorAll('.desktop-icon')[4];
    
    if (myFilesIcon) {
        myFilesIcon.addEventListener('click', openMyFiles);
    }
    if (musicIcon) {
        musicIcon.addEventListener('click', openMusic);
    }
    if (photosIcon) {
        photosIcon.addEventListener('click', openPhotos);
    }
    if (videosIcon) {
        videosIcon.addEventListener('click', openVideos);
    }
}

function closeGame() {
    const gameWindow = document.getElementById('gameWindow');
    const desktop = document.getElementById('desktop');
    
    // Stop ALL audio
    Object.values(audio).forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });
    
    // Reset game state
    gameState.playerName = '';
    gameState.currentScreen = 'start';
    gameState.dialogStep = 0;
    gameState.gregoryFound = false;
    currentDialogIndex = 0;
    dialogMode = 'initial';
    pausedAudio = null;
    
    // Collapse music player
    if (musicPlayer.container) {
        musicPlayer.container.classList.add('collapsed');
    }
    
    // Reset all screens using the proper method
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Reset intro screen elements
    const studioLogo = document.getElementById('studioLogo');
    const presentsText = document.getElementById('presentsText');
    if (studioLogo) {
        studioLogo.classList.add('hidden');
        studioLogo.classList.remove('fade-in', 'fade-out');
    }
    if (presentsText) {
        presentsText.classList.add('hidden');
        presentsText.classList.remove('fade-in', 'fade-out');
    }
    
    // Set intro as the active screen for next time
    if (screens.intro) {
        screens.intro.classList.add('active');
    }
    
    // Hide choice modal
    const choiceModal = document.getElementById('choiceModal');
    if (choiceModal) {
        choiceModal.classList.remove('active');
    }
    
    // Hide item focus overlay
    const itemFocusOverlay = document.getElementById('itemFocusOverlay');
    if (itemFocusOverlay) {
        itemFocusOverlay.classList.add('hidden');
    }
    
    // Reset ending screen elements
    const elementsToHide = [
        'sadTextContainer', 'badEndingText', 'happyTextContainer', 
        'goodEndingText', 'celebrationImage', 'slideshow1', 'slideshow2',
        'bonusUnlocked', 'gregoryWatch'
    ];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('show', 'fade-in', 'fade-out');
        }
    });
    
    // Reset typed text
    const typedText = document.getElementById('typedText');
    const happyTypedText = document.getElementById('happyTypedText');
    const bonusDialogText = document.getElementById('bonusDialogText');
    if (typedText) typedText.textContent = '';
    if (happyTypedText) happyTypedText.textContent = '';
    if (bonusDialogText) bonusDialogText.textContent = '';
    
    // Reset videos
    const sadBridgeVideo = document.getElementById('sadBridgeVideo');
    const gregoryVideo = document.getElementById('gregoryVideo');
    if (sadBridgeVideo) {
        sadBridgeVideo.pause();
        sadBridgeVideo.currentTime = 0;
        sadBridgeVideo.classList.remove('fade-out');
    }
    if (gregoryVideo) {
        gregoryVideo.pause();
        gregoryVideo.currentTime = 0;
        gregoryVideo.classList.remove('fade-out');
    }
    
    // Reset name input
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.value = '';
        nameInput.classList.remove('error');
    }
    
    // Hide game, show desktop
    gameWindow.classList.add('hidden');
    desktop.classList.remove('hidden');
}

function closeFileExplorer() {
    const fileExplorer = document.getElementById('fileExplorer');
    fileExplorer.classList.add('hidden');
}

function closeMediaViewer() {
    const mediaViewer = document.getElementById('mediaViewer');
    const viewerContent = document.getElementById('viewerContent');
    const audioControls = document.getElementById('audioControls');
    
    // Stop any playing media
    const media = viewerContent.querySelector('audio, video');
    if (media) {
        media.pause();
        media.currentTime = 0;
    }
    
    // Clear content
    viewerContent.innerHTML = '';
    audioControls.classList.add('hidden');
    
    mediaViewer.classList.add('hidden');
}

// File System Structure
const fileSystem = {
    'My Files': {
        type: 'root',
        children: {
            'audio': {
                type: 'folder',
                children: {
                    'smooth-jazz-start.mp3': { type: 'file', category: 'audio' },
                    'smooth-jazz-main.mp3': { type: 'file', category: 'audio' },
                    'sad-jazz.mp3': { type: 'file', category: 'audio' }
                }
            },
            'images': {
                type: 'folder',
                children: {
                    'imms-character.png': { type: 'file', category: 'image' },
                    'imms-both-gifts.png': { type: 'file', category: 'image' },
                    'imms-flowers.png': { type: 'file', category: 'image' },
                    'picture-frame.png': { type: 'file', category: 'image' },
                    'plushies.png': { type: 'file', category: 'image' },
                    'room-background.png': { type: 'file', category: 'image' },
                    'celebration.png': { type: 'file', category: 'image' },
                    'gregory-grasshopper.png': { type: 'file', category: 'image' },
                    'gregory-watch.png': { type: 'file', category: 'image' }
                }
            },
            'videos': {
                type: 'folder',
                children: {
                    'sad-bridge.mp4': { type: 'file', category: 'video' },
                    'gregory-meme.mp4': { type: 'file', category: 'video' }
                }
            }
        }
    }
};

let currentPath = [];

function openMyFiles() {
    currentPath = ['My Files'];
    renderFileExplorer();
}

function openMusic() {
    currentPath = ['My Files', 'audio'];
    renderFileExplorer();
}

function openPhotos() {
    currentPath = ['My Files', 'images'];
    renderFileExplorer();
}

function openVideos() {
    currentPath = ['My Files', 'videos'];
    renderFileExplorer();
}

function renderFileExplorer() {
    const fileExplorer = document.getElementById('fileExplorer');
    const explorerContent = document.getElementById('explorerContent');
    const explorerTitle = document.getElementById('explorerTitle');
    const breadcrumb = document.getElementById('breadcrumb');
    const backButton = document.getElementById('backButton');
    
    // Update title and breadcrumb
    explorerTitle.textContent = currentPath[currentPath.length - 1] || 'My Files';
    breadcrumb.textContent = currentPath.join(' > ');
    
    // Enable/disable back button
    backButton.disabled = currentPath.length <= 1;
    
    // Get current directory - need to traverse through children
    let currentDir = fileSystem[currentPath[0]]; // Start with 'My Files'
    for (let i = 1; i < currentPath.length; i++) {
        if (currentDir && currentDir.children) {
            currentDir = currentDir.children[currentPath[i]];
        }
    }
    
    // Clear content
    explorerContent.innerHTML = '';
    
    // Render folders and files
    if (currentDir && currentDir.children) {
        Object.keys(currentDir.children).forEach(name => {
            const item = currentDir.children[name];
            const itemEl = document.createElement('div');
            itemEl.className = item.type === 'folder' ? 'folder-item' : 'file-item';
            
            const icon = document.createElement('div');
            icon.className = item.type === 'folder' ? 'folder-icon' : 'file-icon';
            icon.textContent = item.type === 'folder' ? '📁' : getFileIcon(name, item.category);
            
            const nameEl = document.createElement('div');
            nameEl.className = item.type === 'folder' ? 'folder-name' : 'file-name';
            nameEl.textContent = name;
            
            itemEl.appendChild(icon);
            itemEl.appendChild(nameEl);
            
            // Click handler
            itemEl.addEventListener('click', () => {
                if (item.type === 'folder') {
                    currentPath.push(name);
                    renderFileExplorer();
                } else {
                    openFile(name, item.category);
                }
            });
            
            explorerContent.appendChild(itemEl);
        });
    }
    
    fileExplorer.classList.remove('hidden');
}

function getFileIcon(filename, category) {
    if (category === 'audio') return '🎵';
    if (category === 'video') return '🎬';
    if (category === 'image') return '🖼️';
    return '📄';
}

function navigateBack() {
    if (currentPath.length > 1) {
        currentPath.pop();
        renderFileExplorer();
    }
}

function openFile(filename, category) {
    const mediaViewer = document.getElementById('mediaViewer');
    const viewerContent = document.getElementById('viewerContent');
    const viewerTitle = document.getElementById('viewerTitle');
    const audioControls = document.getElementById('audioControls');
    
    viewerTitle.textContent = filename;
    viewerContent.innerHTML = '';
    
    // Construct file path
    const folderPath = currentPath.slice(1).join('/');
    const filePath = folderPath ? `${folderPath}/${filename}` : filename;
    
    if (category === 'image') {
        const img = document.createElement('img');
        img.src = filePath;
        img.alt = filename;
        viewerContent.appendChild(img);
        audioControls.classList.add('hidden');
    } else if (category === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        const source = document.createElement('source');
        source.src = filePath;
        source.type = 'video/mp4';
        video.appendChild(source);
        viewerContent.appendChild(video);
        audioControls.classList.add('hidden');
    } else if (category === 'audio') {
        // Create custom audio player
        const audioEl = document.createElement('audio');
        audioEl.src = filePath;
        audioEl.id = 'viewerAudio';
        viewerContent.appendChild(audioEl);
        
        // Show large music visualizer
        const visualizer = document.createElement('div');
        visualizer.style.cssText = 'font-size: 120px; color: #ff69b4; animation: musicalNote 2s ease-in-out infinite;';
        visualizer.textContent = '♪';
        viewerContent.appendChild(visualizer);
        
        audioControls.classList.remove('hidden');
        initAudioPlayer(audioEl);
    }
    
    mediaViewer.classList.remove('hidden');
}

function initAudioPlayer(audioEl) {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    
    // Play/Pause
    playPauseBtn.onclick = () => {
        if (audioEl.paused) {
            audioEl.play();
            playPauseBtn.textContent = '⏸';
        } else {
            audioEl.pause();
            playPauseBtn.textContent = '▶';
        }
    };
    
    // Update progress
    audioEl.ontimeupdate = () => {
        const progress = (audioEl.currentTime / audioEl.duration) * 100;
        progressBar.style.width = progress + '%';
        
        const currentMin = Math.floor(audioEl.currentTime / 60);
        const currentSec = Math.floor(audioEl.currentTime % 60).toString().padStart(2, '0');
        const totalMin = Math.floor(audioEl.duration / 60);
        const totalSec = Math.floor(audioEl.duration % 60).toString().padStart(2, '0');
        
        timeDisplay.textContent = `${currentMin}:${currentSec} / ${totalMin}:${totalSec}`;
    };
    
    // Seek
    progressContainer.onclick = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioEl.currentTime = percent * audioEl.duration;
    };
    
    // Auto-play
    audioEl.play();
    playPauseBtn.textContent = '⏸';
}

// Handle audio autoplay restrictions
document.addEventListener('click', function enableAudio() {
    Object.values(audio).forEach(sound => {
        if (sound) sound.load();
    });
    document.removeEventListener('click', enableAudio);
}, { once: true });
