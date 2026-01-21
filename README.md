# 💕 Valentine's Game - Asset Guide

## 🎮 Game Overview
A retro-styled Valentine's Day visual novel game with multiple scenes and interactive elements.

## 📂 Required Assets

### 🖼️ Images & Videos (Place in `/images` folder)

**Note:** Three assets are video files (.mp4) but should still be placed in the `/images` folder.

1. **imms-character.png**
   - Main character sprite
   - Recommended size: 150x200px (will be scaled)
   - Style: Pixelated/retro
   - Used in: Room and Dialog scenes

2. **room-background.png**
   - Background for the room scene
   - Recommended size: 800x600px
   - Style: Pixelated room interior
   - Valentine's themed decorations

3. **teddy-bear.png**
   - Clickable object in room
   - Recommended size: 80x100px
   - Style: Cute pixelated teddy bear

4. **flowers.png**
   - Clickable object in room
   - Recommended size: 100x120px
   - Style: Bouquet of flowers, pixelated

5. **chocolates.png**
   - Clickable object in room
   - Recommended size: 90x70px
   - Style: Box of chocolates, pixelated

6. **imms-flowers.png**
   - Happy ending slideshow (first image)
   - Recommended size: 800x600px
   - Style: Imms character holding/presenting flowers
   - Used in good ending sequence

7. **imms-both-gifts.png**
   - Happy ending slideshow (second image)
   - Recommended size: 800x600px
   - Style: Imms character with both flowers and chocolates
   - Used in good ending sequence

8. **sad-bridge.mp4**
   - Sad ending video scene
   - Recommended duration: 5-10 seconds
   - Style: Character standing on bridge at sunset
   - Melancholic atmosphere
   - **Note: Video should have NO AUDIO** (will be muted in game)

7. **celebration.mp4**
   - Happy ending video scene
   - Recommended duration: 5-10 seconds
   - Style: Celebratory scene with confetti/hearts
   - Joyful atmosphere
   - **Note: Video should have NO AUDIO** (will be muted in game)

8. **gregory-meme.mp4**
   - The famous Gregory grasshopper meme video
   - Recommended duration: 5-15 seconds
   - Style: Severely pixelated grasshopper
   - **Note: Video should have NO AUDIO** (will be muted in game)

### 🎵 Audio (Place in `/audio` folder)

1. **smooth-jazz-start.mp3**
   - Plays during the start screen
   - Style: Smooth, romantic jazz
   - Should loop

2. **smooth-jazz-main.mp3**
   - Plays during room and dialog scenes
   - Style: Smooth, romantic jazz (can be same as start or different)
   - Should loop

3. **heartbeat.mp3**
   - Plays during the choice modal
   - Style: Heartbeat sound effect for suspense
   - Should loop

4. **sad-jazz.mp3**
   - Plays during sad ending
   - Style: Melancholic, slow jazz
   - Should loop

5. **celebration.mp3**
   - Plays during happy ending
   - Style: Upbeat, celebratory music
   - Plays once (5 seconds before Gregory)

6. **gregory-jazz.mp3**
   - Plays during Gregory meme screen
   - Style: Jazzy meme music
   - Should loop

## 🎯 Game Flow

1. **Start Screen** → Smooth jazz plays, animated button
2. **Name Entry** → Silent, dark screen
3. **Room Scene** → Jazz resumes, click objects to explore
4. **Dialog Scene** → Continue jazz, visual novel style
5. **Choice Modal** → Heartbeat plays, Yes/No options
6. **Endings:**
   - **YES** → Slideshow (flowers → both gifts) → Celebration video → Sweet message → "Guest appearance from:" → Gregory video → "GOOD ENDING" → Restart
   - **NO** → Sad jazz → Video plays → Animated text → "BAD ENDING" → Restart

## 🚀 How to Run

1. Add all PNG images to the `/images` folder
2. Add all MP3 audio files to the `/audio` folder
3. Open `index.html` in a web browser
4. Enjoy the game! 💖

## 🎨 Style Notes

- Everything should have a pixelated/retro aesthetic
- Valentine's color scheme: pinks, reds, purples
- Keep it cute and romantic!
- 800x600 game window (classic retro resolution)

## ⌨️ Controls

- **Space** or **Click** to start
- **Enter** or **Click Enter button** to submit name
- **Click objects** in the room to interact
- **Click** to advance dialog
- **Click Yes/No** for final choice

---

Made with 💕 for an extra special Valentine!
