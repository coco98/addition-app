gsap.registerPlugin(Draggable);

class BridgeGame {
    constructor() {
        this.slots = document.querySelectorAll('.plank-slot');
        this.monkey = document.getElementById('monkey');
        this.placedPlanks = 0;
        this.isGameComplete = false;
        this.plankGroups = [];
        
        this.init();
    }
    
    init() {
        this.generatePlankGroups();
        this.scalePlanks();
        this.animateMonkey();
        
        // Setup dragging after DOM is updated
        setTimeout(() => {
            this.setupDraggable();
        }, 100);
    }
    
    generatePlankGroups() {
        // Possible combinations that add up to 5
        const combinations = [
            [1, 1, 1, 1, 1],  // Five 1s
            [2, 3],           // 2 and 3
            [1, 4],           // 1 and 4
            [2, 1, 2],        // 2, 1, 2
            [3, 1, 1],        // 3, 1, 1
            [1, 2, 2],        // 1, 2, 2
            [2, 2, 1],        // 2, 2, 1
            [1, 1, 3],        // 1, 1, 3
            [5]               // Single 5
        ];
        
        // Pick a random combination
        const selectedCombination = combinations[Math.floor(Math.random() * combinations.length)];
        
        // Clear existing planks container
        const planksContainer = document.getElementById('planksContainer');
        planksContainer.innerHTML = '';
        
        // Create plank groups directly in game container for absolute positioning
        const gameContainer = document.getElementById('gameContainer');
        const totalGroups = selectedCombination.length;
        selectedCombination.forEach((count, index) => {
            this.createPlankGroup(count, index, gameContainer, totalGroups);
        });
    }
    
    createPlankGroup(count, groupIndex, container, totalGroups) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'plank-group';
        
        // Better spacing - calculate based on actual container widths
        const scale = window.innerWidth / 2816;
        const plankWidth = 180 * scale;
        const containerWidth = count * plankWidth + (count - 1) * 4;
        
        // Scatter groups across the top area with varied positions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Define scattered positions for each group with more varied vertical positions
        const scatterPatterns = [
            { x: 0.1, y: 0.05 },   // Top left
            { x: 0.3, y: 0.25 },   // Left center, much lower
            { x: 0.55, y: 0.1 },   // Right center, higher  
            { x: 0.75, y: 0.35 },  // Right, much lower
            { x: 0.85, y: 0.15 }   // Far right, middle
        ];
        
        // Use pattern for this group, or create a random one if we have more than 5 groups
        const pattern = scatterPatterns[groupIndex % scatterPatterns.length];
        const leftPos = (pattern.x * screenWidth) - (containerWidth / 2);
        const topPos = pattern.y * screenHeight;
        
        console.log(`Group ${groupIndex}: pattern.y=${pattern.y}, screenHeight=${screenHeight}, topPos=${topPos}`);
        
        // Container dimensions already calculated above
        const plankHeight = 118 * scale;
        const containerHeight = plankHeight + 20; // plank height + padding
        
        groupDiv.style.cssText = `
            position: absolute;
            left: ${leftPos}px;
            top: ${topPos}px;
            width: ${containerWidth}px;
            height: ${containerHeight}px;
            cursor: grab;
            z-index: 100;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 4px;
        `;
        
        groupDiv.addEventListener('mousedown', () => {
            groupDiv.style.cursor = 'grabbing';
        });
        
        groupDiv.addEventListener('mouseup', () => {
            groupDiv.style.cursor = 'grab';
        });
        
        // Create planks within the group (arranged horizontally)
        for (let i = 0; i < count; i++) {
            const plank = document.createElement('img');
            plank.src = 'plank.png';
            plank.className = 'plank group-plank';
            plank.style.cssText = `
                position: relative;
                flex-shrink: 0;
                pointer-events: none;
            `;
            groupDiv.appendChild(plank);
        }
        
        // Add number label
        const label = document.createElement('div');
        label.textContent = count;
        label.style.cssText = `
            position: absolute;
            bottom: -55px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 56px;
            font-weight: bold;
            font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
            color: white;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.9);
            pointer-events: none;
        `;
        groupDiv.appendChild(label);
        
        groupDiv.dataset.value = count;
        container.appendChild(groupDiv);
        
        this.plankGroups.push({
            element: groupDiv,
            value: count,
            placed: false
        });
    }
    
    scalePlanks() {
        // Calculate scale based on viewport width vs original image width
        const scale = window.innerWidth / 2816;
        
        // Apply scaling to planks within groups
        document.querySelectorAll('.plank').forEach(plank => {
            plank.style.width = `${180 * scale}px`;
            plank.style.height = `${118 * scale}px`;
        });
        
        // Apply scaling to plank slots (same size as planks)
        this.slots.forEach(slot => {
            slot.style.width = `${180 * scale}px`;
            slot.style.height = `${118 * scale}px`;
        });
    }
    
    setupDraggable() {
        console.log('Setting up draggable for', this.plankGroups.length, 'groups');
        
        this.plankGroups.forEach((group, index) => {
            console.log('Setting up group', index, group.element);
            const originalX = group.element.offsetLeft;
            const originalY = group.element.offsetTop;
            
            Draggable.create(group.element, {
                type: "x,y",
                bounds: "#gameContainer",
                edgeResistance: 0.8,
                throwProps: true,
                onDragStart: () => {
                    // Add pulse/wiggle animation when dragging starts
                    gsap.to(group.element, {
                        duration: 0.3,
                        scale: 1.1,
                        rotation: "+=5",
                        ease: "back.out(1.7)"
                    });
                    // Add continuous wiggle while dragging
                    group.wiggleAnimation = gsap.to(group.element, {
                        duration: 0.2,
                        rotation: "+=3",
                        yoyo: true,
                        repeat: -1,
                        ease: "power2.inOut"
                    });
                },
                onDragEnd: () => {
                    // Stop the wiggle animation and reset transforms
                    if (group.wiggleAnimation) {
                        group.wiggleAnimation.kill();
                        group.wiggleAnimation = null;
                    }
                    gsap.to(group.element, {
                        duration: 0.2,
                        scale: 1,
                        rotation: 0,
                        ease: "power2.out"
                    });
                    
                    const droppedSlots = this.checkGroupSlotCollision(group.element, group.value);
                    
                    if (droppedSlots && droppedSlots.length === group.value) {
                        this.snapGroupToSlots(group.element, droppedSlots);
                        
                        // Mark slots as occupied
                        droppedSlots.forEach(slot => {
                            slot.hasPlank = true;
                        });
                        
                        group.placed = true;
                        this.placedPlanks += group.value;
                        
                        // Hide the group after placing
                        group.element.style.display = 'none';
                        
                        if (this.placedPlanks === 5) {
                            this.completeGame();
                        }
                    } else {
                        // Return to original position
                        gsap.to(group.element, {
                            duration: 0.3,
                            x: originalX - group.element.offsetLeft,
                            y: originalY - group.element.offsetTop,
                            ease: "back.out(1.7)"
                        });
                    }
                }
            });
        });
    }
    
    checkGroupSlotCollision(group, value) {
        const groupRect = group.getBoundingClientRect();
        const groupCenterX = groupRect.left + groupRect.width / 2;
        const groupCenterY = groupRect.top + groupRect.height / 2;
        
        // Find the best consecutive group of available slots
        let bestSlots = null;
        let minDistance = Infinity;
        
        // Try all possible consecutive slot combinations
        for (let startIndex = 0; startIndex <= this.slots.length - value; startIndex++) {
            const consecutiveSlots = [];
            let allAvailable = true;
            
            // Check if we have 'value' consecutive available slots starting from startIndex
            for (let i = startIndex; i < startIndex + value; i++) {
                if (this.slots[i].hasPlank) {
                    allAvailable = false;
                    break;
                }
                consecutiveSlots.push(this.slots[i]);
            }
            
            if (!allAvailable) continue;
            
            // Calculate the center of this group of consecutive slots
            const firstSlotRect = consecutiveSlots[0].getBoundingClientRect();
            const lastSlotRect = consecutiveSlots[consecutiveSlots.length - 1].getBoundingClientRect();
            const slotGroupCenterX = (firstSlotRect.left + lastSlotRect.right) / 2;
            const slotGroupCenterY = (firstSlotRect.top + lastSlotRect.bottom) / 2;
            
            // Calculate distance from dropped group center to this slot group center
            const distance = Math.sqrt(
                Math.pow(groupCenterX - slotGroupCenterX, 2) + 
                Math.pow(groupCenterY - slotGroupCenterY, 2)
            );
            
            if (distance < 120 && distance < minDistance) {
                minDistance = distance;
                bestSlots = consecutiveSlots;
            }
        }
        
        return bestSlots;
    }
    
    snapGroupToSlots(group, slots) {
        // Create individual planks in the slots
        slots.forEach((slot, index) => {
            const plank = document.createElement('img');
            plank.src = 'plank.png';
            plank.className = 'plank placed-plank';
            plank.style.cssText = `
                position: absolute;
                pointer-events: none;
                z-index: 15;
            `;
            
            const slotRect = slot.getBoundingClientRect();
            const gameRect = document.getElementById('gameContainer').getBoundingClientRect();
            
            plank.style.left = `${slotRect.left - gameRect.left}px`;
            plank.style.top = `${slotRect.top - gameRect.top}px`;
            
            document.getElementById('gameContainer').appendChild(plank);
            
            // Apply scaling
            const scale = window.innerWidth / 2816;
            plank.style.width = `${180 * scale}px`;
            plank.style.height = `${118 * scale}px`;
        });
    }
    
    animateMonkey() {
        let frame = 0;
        const totalFrames = 17;
        const frameWidth = 64;
        
        setInterval(() => {
            if (!this.isGameComplete) {
                const xPos = -(frame * 64);
                this.monkey.style.backgroundPosition = `${xPos}px 0`;
                frame = (frame + 1) % totalFrames;
            }
        }, 150);
    }
    
    completeGame() {
        this.isGameComplete = true;
        
        gsap.to(this.monkey, {
            duration: 5,
            x: "+=60vw",
            ease: "power2.inOut",
            onComplete: () => {
                this.playMultipleJumps();
            }
        });
        
        this.monkey.style.backgroundImage = "url('jungle-monkey-platformer/1-Sprites/Character-Spritesheets/2-Run/Run.png')";
        this.monkey.style.backgroundSize = "512px 64px";
        
        let runFrame = 0;
        const runFrames = 8;
        const runInterval = setInterval(() => {
            const xPos = -(runFrame * 64);
            this.monkey.style.backgroundPosition = `${xPos}px 0`;
            runFrame = (runFrame + 1) % runFrames;
        }, 80);
        
        setTimeout(() => {
            clearInterval(runInterval);
        }, 3000);
    }
    
    playMultipleJumps() {
        // Switch to jump sprite
        this.monkey.style.backgroundImage = "url('jungle-monkey-platformer/1-Sprites/Character-Spritesheets/3-Jump/Jump.png')";
        this.monkey.style.backgroundSize = "256px 64px";
        
        let jumpCount = 0;
        const totalJumps = 3;
        
        const performJump = () => {
            jumpCount++;
            
            // Flip monkey horizontally for alternating jumps (look around effect)
            const shouldFlip = jumpCount % 2 === 1;
            gsap.set(this.monkey, {
                scaleX: shouldFlip ? -2 : 2,
                scaleY: 2
            });
            
            // Animate the jump (vertical movement)
            gsap.to(this.monkey, {
                duration: 0.6,
                y: "-=80px",
                ease: "power2.out",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    if (jumpCount < totalJumps) {
                        // Wait a bit then do another jump
                        setTimeout(performJump, 300);
                    } else {
                        // All jumps done, celebrate
                        this.celebrateCompletion();
                    }
                }
            });
            
            // Animate through jump frames for this jump
            let jumpFrame = 0;
            const jumpFrames = 4;
            const jumpInterval = setInterval(() => {
                const xPos = -(jumpFrame * 64);
                this.monkey.style.backgroundPosition = `${xPos}px 0`;
                jumpFrame = (jumpFrame + 1) % jumpFrames;
            }, 150);
            
            setTimeout(() => {
                clearInterval(jumpInterval);
            }, 1200);
        };
        
        // Start the first jump
        performJump();
    }
    
    celebrateCompletion() {
        const againButton = document.createElement('img');
        againButton.src = 'again.png';
        againButton.id = 'againButton';
        againButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            cursor: pointer;
            z-index: 100;
            width: 200px;
            height: auto;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        `;
        
        // Add click/tap handlers
        againButton.addEventListener('mousedown', () => {
            // Press effect
            gsap.to(againButton, {
                duration: 0.1,
                scale: 0.9,
                ease: "power2.out"
            });
        });
        
        againButton.addEventListener('mouseup', () => {
            // Release effect and restart game
            gsap.to(againButton, {
                duration: 0.2,
                scale: 1,
                ease: "back.out(1.7)",
                onComplete: () => {
                    this.restartGame();
                }
            });
        });
        
        // Touch handlers for mobile
        againButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            gsap.to(againButton, {
                duration: 0.1,
                scale: 0.9,
                ease: "power2.out"
            });
        });
        
        againButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            gsap.to(againButton, {
                duration: 0.2,
                scale: 1,
                ease: "back.out(1.7)",
                onComplete: () => {
                    this.restartGame();
                }
            });
        });
        
        document.getElementById('gameContainer').appendChild(againButton);
        
        gsap.from(againButton, {
            duration: 0.5,
            scale: 0,
            ease: "back.out(1.7)"
        });
    }
    
    restartGame() {
        // Reset game state
        this.placedPlanks = 0;
        this.isGameComplete = false;
        this.plankGroups = [];
        
        // Remove again button
        const againButton = document.getElementById('againButton');
        if (againButton) {
            againButton.remove();
        }
        
        // Clear all placed planks
        document.querySelectorAll('.placed-plank').forEach(plank => plank.remove());
        
        // Reset monkey position and transform
        gsap.set(this.monkey, {
            x: 0,
            y: 0,
            scaleX: 2,
            scaleY: 2
        });
        
        // Reset monkey sprite to idle
        this.monkey.style.backgroundImage = "url('jungle-monkey-platformer/1-Sprites/Character-Spritesheets/1-Idle/Idle.png')";
        this.monkey.style.backgroundSize = "1152px 64px";
        
        // Reset slots
        this.slots.forEach(slot => {
            slot.hasPlank = false;
        });
        
        // Regenerate new plank groups and restart
        this.generatePlankGroups();
        this.scalePlanks();
        this.animateMonkey();
        
        setTimeout(() => {
            this.setupDraggable();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating BridgeGame');
    try {
        new BridgeGame();
    } catch (error) {
        console.error('Error creating BridgeGame:', error);
    }
});