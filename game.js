gsap.registerPlugin(Draggable);

class BridgeGame {
    constructor() {
        this.planks = document.querySelectorAll('.plank');
        this.slots = document.querySelectorAll('.plank-slot');
        this.monkey = document.getElementById('monkey');
        this.placedPlanks = 0;
        this.isGameComplete = false;
        
        this.init();
    }
    
    init() {
        this.setupDraggable();
        this.animateMonkey();
    }
    
    setupDraggable() {
        this.planks.forEach((plank, index) => {
            const originalX = plank.offsetLeft;
            const originalY = plank.offsetTop;
            
            Draggable.create(plank, {
                type: "x,y",
                bounds: "#gameContainer",
                edgeResistance: 0.8,
                throwProps: true,
                onDragEnd: () => {
                    const droppedOnSlot = this.checkSlotCollision(plank);
                    
                    if (droppedOnSlot && !droppedOnSlot.hasPlank) {
                        this.snapToSlot(plank, droppedOnSlot);
                        droppedOnSlot.hasPlank = true;
                        plank.isPlaced = true;
                        this.placedPlanks++;
                        
                        if (this.placedPlanks === 5) {
                            this.completeGame();
                        }
                    } else {
                        gsap.to(plank, {
                            duration: 0.3,
                            x: originalX - plank.offsetLeft,
                            y: originalY - plank.offsetTop,
                            ease: "back.out(1.7)"
                        });
                    }
                }
            });
        });
    }
    
    checkSlotCollision(plank) {
        const plankRect = plank.getBoundingClientRect();
        const plankCenterX = plankRect.left + plankRect.width / 2;
        const plankCenterY = plankRect.top + plankRect.height / 2;
        
        for (let slot of this.slots) {
            if (slot.hasPlank) continue;
            
            const slotRect = slot.getBoundingClientRect();
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(plankCenterX - slotCenterX, 2) + 
                Math.pow(plankCenterY - slotCenterY, 2)
            );
            
            if (distance < 80) {
                return slot;
            }
        }
        
        return null;
    }
    
    snapToSlot(plank, slot) {
        const slotRect = slot.getBoundingClientRect();
        const gameRect = document.getElementById('gameContainer').getBoundingClientRect();
        const plankRect = plank.getBoundingClientRect();
        
        const targetX = slotRect.left - gameRect.left;
        const targetY = slotRect.top - gameRect.top;
        
        const currentX = plankRect.left - gameRect.left;
        const currentY = plankRect.top - gameRect.top;
        
        gsap.to(plank, {
            duration: 0.3,
            x: "+=" + (targetX - currentX),
            y: "+=" + (targetY - currentY),
            ease: "back.out(1.7)"
        });
    }
    
    animateMonkey() {
        let frame = 0;
        const totalFrames = 17;
        const frameWidth = 64;
        
        setInterval(() => {
            if (!this.isGameComplete) {
                const xPos = -(frame * frameWidth);
                this.monkey.style.backgroundPosition = `${xPos}px 0`;
                frame = (frame + 1) % totalFrames;
            }
        }, 150);
    }
    
    completeGame() {
        this.isGameComplete = true;
        
        gsap.to(this.monkey, {
            duration: 3,
            x: "+=40vw",
            ease: "power2.inOut",
            onComplete: () => {
                this.celebrateCompletion();
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
    
    celebrateCompletion() {
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉 Bridge Complete! 🎉';
        celebration.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 100;
            text-align: center;
        `;
        
        document.getElementById('gameContainer').appendChild(celebration);
        
        gsap.from(celebration, {
            duration: 0.5,
            scale: 0,
            ease: "back.out(1.7)"
        });
        
        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BridgeGame();
});