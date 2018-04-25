/*
    Much of the UI in MLS5 uses hardcoded pixel values to position elements.
    This isn't ideal design, but the pixel art means we want to be careful
    with resizing (don't want any antialiasing). Often just easier to do it
    directly in the code.
*/

/* TODO: have a look at these globals and see which need to/can be moved to the mapState object */

//UI positioning values
var mapOffsetX = 8;
var mapOffsetY = 40;

//UI elements
var groupIcons;
var systemIcons;
var selectedIcon;
var icon_selector;
var connectingLines = [];

var mapPanel;
var mapBG;  //The image we use as the background of the map.

var jumpButton;

var systemPanel;
var systemPanel_name;
var systemPanel_description;

var mapState = {
	
	preload: function() {
		
		//Slick UI library
		slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
		slickUI.load('res/ui/kenney/kenney.json');
	},
	
    create: function () {
        
        slickUI.add(mapPanel = new SlickUI.Element.Panel(0, 0, game.width, game.height));
        mapPanel.add(new SlickUI.Element.Text(4, 0, "GALACTIC MAP", 24));
        
        mapPanel.add(mapBG = new SlickUI.Element.DisplayObject(mapOffsetX, mapOffsetY, game.make.sprite(0, 0, 'bg_map')));
        
        mapBG.add(icon_selector = new SlickUI.Element.DisplayObject(0, 0, game.make.sprite(0, 0, 'icon_planet_selector')));
        
        icon_selector.visible = false;
        
        /*
            Now we read the mapData JSON file, which has details for all the star systems on the map.
            Each system has a position, an index for which sprite to use, a few other bits of data, and
            a small array of indexes for other systems you can jump to from that system.
        */
        
        systemIcons = [];
        groupIcons = game.add.group();
        
        for (var i = 0; i < mapData.systems.length; i++) {
            
            var starSystem = mapData.systems[i];
			
            for (var j = 0; j < starSystem.reachableSystems.length; j++) {
                
                //Draw lines to show where you can jump to.
                var reachableSystem = mapData.systems[starSystem.reachableSystems[j]];
                var line = new Phaser.Line(starSystem.x, starSystem.y, reachableSystem.x, reachableSystem.y);
                connectingLines[connectingLines.length] = line;
                
                var graphicsLine = game.make.graphics(0, 0);
                graphicsLine.lineStyle(2, 0x00ffe2, .4);
                graphicsLine.moveTo(line.start.x, line.start.y);
                graphicsLine.lineTo(line.end.x, line.end.y);
                graphicsLine.endFill();

                var iconRadius = 10;
                
                /*
                    We're rendering the lines as textures for performance reasons, but this means
					that if the end point is above or to the left of the start point, you need to
					adjust the position of the texture
                */
                
                var yCorrection;
				var xCorrection;
                
                if (line.angle < 0) {
                    yCorrection = -line.height;
                } else {
                    yCorrection = 0;
                }
                
                if (line.end.x < line.start.x) {
                    xCorrection = -line.width;
                } else {
                    xCorrection = 0;
                }
                
                var myLine = game.add.image(line.start.x + mapOffsetX + iconRadius + xCorrection, line.start.y + mapOffsetY + iconRadius + yCorrection, graphicsLine.generateTexture());
                
                graphicsLine.destroy();
            }
            
            //Now add the icons.
            mapBG.add(systemIcons[i] = new SlickUI.Element.DisplayObject(starSystem.x, starSystem.y, game.make.image(0, 0, 'icon_planet' + starSystem.spriteIndex)));
			
			//Add visual danger indicators
			if (starSystem.danger != null) {
				mapBG.add(new SlickUI.Element.DisplayObject(starSystem.x - 24, starSystem.y - 24, game.make.image(0, 0, 'icon_' + starSystem.danger.toLowerCase())));
			}
			
			//Give each icon a reference to the JSON information about that system
			systemIcons[i].data = starSystem;
			
			//Allow us to select the icons by clicking (or tapping)
            systemIcons[i].inputEnabled = true;
            
            systemIcons[i].events.onInputDown.add(mapState.selectIcon, {icon: systemIcons[i]});
			
            groupIcons.add(systemIcons[i].sprite);
        }
        
		//Create the highlight to show the player's current system. (Using a 16px offset because the highlight has an extra bit on top)
		
        var highlight;
        
        var highlightedSystem = mapData.systems[mapData.shipPosition];
        mapBG.add(highlight = new SlickUI.Element.DisplayObject(highlightedSystem.x, highlightedSystem.y - 16, game.make.image(0, 0, 'icon_planet_highlight')));
        
        //Create the panel which shows information about the selected system
        mapPanel.add(systemPanel = new SlickUI.Element.Panel(mapPanel.width - 260, mapPanel.height-320, 220, 220));
        
        systemPanel.alpha = 0.8;
        
        systemPanel.add(systemPanel_name = new SlickUI.Element.Text(2, 0, "SYSTEM"), 14).centerHorizontally();
        systemPanel.add(systemPanel_description = new SlickUI.Element.Text(2, 28, "Description text"), 12);
        systemPanel.visible = false;
        
        //Create the button to jump to the selected system
		
        mapPanel.add(jumpButton = new SlickUI.Element.Button(game.width/2 - 60, game.height-82, 120, 60));
        jumpButton.events.onInputUp.add(function () {sound_select.play(); mapState.jump();});
        jumpButton.add(new SlickUI.Element.Text(0, 0, "Jump", 24)).center();
		jumpButton.visible = false;
    },
    
    update: function() {
        
        game.world.bringToTop(groupIcons);
        
    },
	
	selectIcon: function(icon) {
		sound_select.play();
		selectedIcon = this.icon;
		
		icon_selector.x = selectedIcon.x + mapOffsetX + 5; //These 'magic numbers' (5 and 7) are half the width and height of the selector icon. (They won't change.)
		icon_selector.y = selectedIcon.y + mapOffsetY - 7;
		icon_selector.visible = true;
		
		jumpButton.visible = false;
		
		if (mapState.canReachSystem(selectedIcon)) {
			jumpButton.visible = true;
		}
        
        systemPanel_name.value = selectedIcon.data.name.toUpperCase();
		systemPanel_name.centerHorizontally();
        systemPanel_description.value = selectedIcon.data.description;
		
		if (selectedIcon.data.danger != null) {
			 systemPanel_description.value += "\n\n" + "DANGER: " + selectedIcon.data.danger;
		}
		
        systemPanel.visible = true;
	},
	
	jump: function() {
		
		/*
			Player has decided to try and jump to a system.
			-Check if the selected system is reachable
			-If so, check if we have enough fuel
			-If so, jump and change ship.currentSystem
			-Else, display some kind of response
		*/
		
		var canMakeJump = false;
		
		var currentSystem = mapData.systems[mapData.shipPosition];
		
        //TODO: do not allow jump if a messagebox is currently being displayed! Otherwise the sneaky jerks can just race right through.
        
		if (mapState.canReachSystem(selectedIcon)) {
			canMakeJump = true;
		}
        
        if (ship.needsRecharge) { 
            canMakeJump = false;
        }
		
		if (!canMakeJump) {
			//Display a warning notice if system is out of reach
			//OR if not enough fuel
			return;
		}
		
		//Checks complete - we can jump!
		
		/* TODO: jump effect goes here */
		
		//Update ship position
		mapData.shipPosition = mapData.systems.indexOf(selectedIcon.data);
		
        systemPanel.visible = false;
		
		ship.day++;
		ship.fuel--;
        ship.needsRecharge = true;
		game.state.start('play');
	},
	
	canReachSystem: function(systemIconToCheck) {
		
		var currentSystem = mapData.systems[mapData.shipPosition];
		
		for (var i = 0; i < currentSystem.reachableSystems.length; i++) {
			if (currentSystem.reachableSystems[i] == mapData.systems.indexOf(systemIconToCheck.data)) {
				return true;
			}
		}
		
		return false;
	}
	
};