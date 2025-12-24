Build a simple client side javascript game. It's a game for a toddler to learn counting. 

The game is building a bridge so that the monkey can cross the river. 
The bridge is broken and there are 5 slots where planks can be fit. 
There are 5 planks that can be dragged from the top area of the screen into the slots. Once all the slots are filled the monkey crosses the bridge. 


The app should be a fullscreen app meant for landscape mode. Webapp, I'll be loading it on my ipad and phone. 
No scrolling, just a fixed size. 

Use GSAP + draggable for a smooth drag and drop of the elements into the slots. 

The main background image is in background.png. 
The plank image is in plank.png.

The monkey sprite animation is from Pixel Jungle Monkey Platformer by Pixelsym
https://pixelsym.itch.io/pixel-jungle-monkey-platformer-beginner-friendly
I've extracted and kept the assets in the jungle-monkey-platformer folder.
you'll see the character spritesheets in: /Users/tanmaigopal/eklavya/addition-app/jungle-monkey-platformer/1-Sprites/Character-Spritesheets

## Image dimensions
Image width: 2816px

Bridge starts at 970px width
Bridge ends at 1990px width
=> So this means that 5 planks will fit in between the 970px mark to the 1990px mark. Account for leaving some gap in the middle.
=> If you do relative calculations it seems that plank slots should start at the 970/2816 percent mark.

Bridge width is 115px which is the raw plank size as well in plank.png.

The bridge is vertically possitioned at 1085px from the top. 
The background.png image height is 1536px, so assuming relative calculations the plank slots should be positioned 1085/1536 percent mark vertically from the top of the window.

