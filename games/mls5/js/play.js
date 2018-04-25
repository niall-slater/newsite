/* GLOBALS */

var scale = 1;

var messageActive = false;

//Event testing

var testing = true;
var eventToTest = "danger_battle";

//Scenery & Objects
var ship = {
	sprite: null,
	posX: 28,
	posY: 48,
	day: 1,
	fuel: 50,
	crew: 129,
	happiness: 100,
	hull: 100,
    needsRecharge: false,
    name_Pilot: "Slipples",
    name_Engineer: "Walker",
    name_Navigator: "Waters",
    name_Security: "Milligan",
	
	reachedDestination: false,
    
    //Parse a JSON object to change some ship data.
    effectChange: function(effect) {
        /*
        The possible effects are:
        resource_fuel +-
        resource_crew +-
        resource_happiness +-
        resource_hull +=
        */
		
        if (effect == null)
            return;
        
        if (effect.resource_fuel != null) {
            ship.fuel += effect.resource_fuel;
			
			if (ship.fuel <= 0) {
				playState.lose();
			}
        }
        if (effect.resource_crew != null) {
            ship.crew += effect.resource_crew;
			
			if (ship.crew <= 0) {
				playState.lose();
			}
        }
        if (effect.resource_happiness != null) {
            ship.happiness += effect.resource_happiness;
        
			if (ship.happiness > 100) {
				ship.happiness = 100;
			}
			
			if (ship.happiness <= 0) {
				playState.lose();
			}
        }
        if (effect.resource_hull != null) {
            ship.hull += effect.resource_hull;
			
			if (ship.hull > 100) {
				ship.hull = 100;
			}
			
			if (ship.hull <= 0) {
				playState.lose();
			}
        }
		
		playState.refreshStatusPanel();
    }
};

var bg = {
	sprite0: null,
	sprite1: null,
	posX: 0
};

var groupBackground;
var groupPlanets;
var groupShip;

//UI
var statusBar = {
	bgSprite: null
};

var crewPanel;

var warnings = {
	sprite_driveCharge: null,
	sprite_driveReady: null
};

var label_STAT;
var label_FUEL;
var label_CREW;
var label_HAPP;
var label_HULL;

var messageBox = {
	title: "MESSAGETITLE",
	content: "MESSAGECONTENT",
	options: null
};
var slickUI;


var playState = {
    
    //State Information
	
	preload: function() {
		groupBackground = game.add.group();
		groupPlanets = game.add.group();
        groupShip = game.add.group();
		
		//Slick UI library
		slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
		slickUI.load('res/ui/kenney/kenney.json');
		
		//Data
		game.load.json("data_eventsStory", "res/data/data_eventsStory.json");
		game.load.json("data_eventsDanger", "res/data/data_eventsDanger.json");
		
	},

	create: function () {
		
		//Initialise scenery & objects
		bg.sprite0 = groupBackground.create(bg.posX, 0, 'bg_starField');
		bg.sprite1 = groupBackground.create(bg.posX + bg.sprite0.width, 0, 'bg_starField');
		
        ship.sprite = groupShip.create(ship.posX, ship.posY, 'anim_ship');
        var animIdle = ship.sprite.animations.add('anim_ship_idle', [0,1,2,3,4,5,6,7]);
        var animJump = ship.sprite.animations.add('anim_ship_jump', [8,9,10,11]);
        var animLand = ship.sprite.animations.add('anim_ship_land', [11,10,9,8]);
        var animCharge = ship.sprite.animations.add('anim_ship_charge', [12,13,14,15]);
        
        ship.sprite.animations.play('anim_ship_idle', 8, true);
        
        animJump.onComplete.add(function() {
			game.state.start('map');
		});
		
        animLand.onComplete.add(function() {
			ship.sprite.animations.play('anim_ship_idle', 8, true);
				
			if (currentDanger !== undefined) {
				playState.fireEvent_Danger(currentDanger);
			}
		});
		
        animCharge.onComplete.add(function(){
			ship.sprite.animations.play('anim_ship_idle', 8, true);
				
				setTimeout(function() {
        			playState.fireEvent_Story();
				}, 300);
		});
        
        var systemObject = mapData.systems[mapData.shipPosition];
		
        groupPlanets.create(0, 0, 'img_scenery_' + systemObject.spriteIndex);
        
        groupPlanets.scale.set(scale);
        groupBackground.scale.set(scale);
        groupShip.scale.set(scale);
		
        this.initUI();
        
		if (systemObject.isDestination) {
			playState.win();
		}
        
        var currentDanger = undefined;
        
		if (systemObject.danger !== null) {
			currentDanger = systemObject.danger;
		}
        
        warning_current = warnings.sprite_driveReady;
        playState.setWarning(warnings.sprite_driveReady);

        if (ship.day > 1) {
           
            if (ship.needsRecharge) {
                //The ship just jumped and needs to recharge. Display some system welcome text, and maybe a danger event.
				
                playState.setWarning(warnings.sprite_driveCharge);
		
				ship.sprite.animations.play('anim_ship_land', 16, false);
				sound_land.play();
            }
        }
	},
	
	update: function() {
		this.scrollBackground();
	},
	
	render: function() {
		
	},
	
	/* SCENERY MANAGEMENT */
	
	scrollBackground: function() {
		
		var backgroundMovement = 0.001 * game.time.elapsed * scale;
		
		bg.posX -= backgroundMovement;
        
		if (bg.posX < 0 - bg.sprite0.width)
			bg.posX = 0;
		
		bg.sprite0.x = bg.posX;
		bg.sprite1.x = bg.posX + bg.sprite0.width;
		
		groupPlanets.x -= backgroundMovement * 6;
		
		if (groupPlanets.x < - bg.sprite0.width * 3)	//The planet scenery image will always be the same width as the background starfield.
			groupPlanets.x = bg.sprite0.width * 2;
	},
	
	/* UI MANAGEMENT */
    
    displayMessage: function(title, content, options) {
		
		messageBox.title = title;
        messageBox.content = content;
		messageBox.options = options;
        
        this.createMessageBox();
    },
    
    displayMessageNoChoice: function(title, content, choiceText) {
        
		var continueJourney = [{choice: choiceText, diceRoll: false, final: true}];
        
        messageBox.title = title;
        messageBox.content = content;
		messageBox.options = continueJourney;
        
        this.createMessageBox();
    },
    
    displayMessageEndgame: function(title, content, choiceText) {
        
		var continueJourney = [{choice: choiceText, diceRoll: false, final: true}];
        
        messageBox.title = title;
        messageBox.content = content;
		messageBox.options = continueJourney;
        
        this.createMessageBoxEndgame();
    },
    
	parseEffectText: function(text, effect) {
		
		//TODO: at the moment only supports two effects - increase to four
		
		var result = text;
		
		result = JSON.stringify(effect);
		result = result.substr(result.indexOf('_')+1);
		result = result.replace('":',": ");
		result = result.replace('}',"");

		if (result.includes(',')) {
			var effectText2 = result.substr(result.indexOf(',')+1);
			result = result.substr(0,result.indexOf(','));
			effectText2 = effectText2.substr(effectText2.indexOf('_')+1);
			effectText2 = effectText2.replace('":',": ");
			effectText2 = effectText2.replace('}',"");

			result += ", " + effectText2;
		}
		
		return result;
	},
	
    createMessageBox: function() {
		
		messageActive = true;
		
		//Set bounds and instantiate panel
        var x = 84 * scale;
        var y = 2 * scale;
        var panel;
        slickUI.add(panel = new SlickUI.Element.Panel(x, y, 168 * scale, 96 * scale));
		
        messageBox.content = playState.swapNames(messageBox.content);
        
		//Add title and content
		var textSize_content = 16;
		
		if (messageBox.content.length > 190 && messageBox.options.length > 1)
			textSize_content = 14;
		
        panel.add(new SlickUI.Element.Text(2 * scale, 0, messageBox.title)).centerHorizontally();
        panel.add(new SlickUI.Element.Text(2 * scale, 12 * scale, messageBox.content, textSize_content));
        
		//Add buttons
		for (var i = 0; i < messageBox.options.length; i++) {
			
			//This is an anonymous wrapper which lets us save the value of i as e - this value will be saved for the callback later
			
			(function(e) {
				
				var button;
				var option = messageBox.options[i];
				
				var optionHeight = 14;
				
				if (messageBox.options.length == 1) {
					panel.add(button = new SlickUI.Element.Button(0, 64 * scale + i * 14 * scale + 50, 164 * scale, optionHeight * scale));	//If there's only one button, shift it to the bottom of the panel.
				} else if (messageBox.options.length == 2) {
					panel.add(button = new SlickUI.Element.Button(0, 64 * scale + i * 14 * scale, 164 * scale, optionHeight * scale));
				} else if (messageBox.options.length == 3) {
					optionHeight = 12;
					panel.add(button = new SlickUI.Element.Button(0, (58 * scale) + (i * optionHeight * scale), 164 * scale, optionHeight * scale));
				}
				button.add(new SlickUI.Element.Text(0,0, playState.swapNames(option.choice))).center();

				//Make the buttons do different stuff depending on what the JSON data says.
				
				if (option.diceRoll) {

					//Save the option for use in the callback later.
					var selectedOption = messageBox.options[e];

					button.events.onInputUp.add(function () {

						//This event requires a roll of the dice to see the outcome.
						//We grab the probability and the win/lose responses from the JSON data

						sound_select.play();
						var response = "Response not set!";
						var effect = "Effect not set!";
						var effectText = "";

						if (Math.random() < selectedOption.winChance) {
							//win!
							response = selectedOption.win.response;
							effect = selectedOption.win.effect;

						} else {
							//fail!
							response = selectedOption.fail.response;
							effect = selectedOption.fail.effect;
						}

						//Parse some JSON:
						effectText = playState.parseEffectText(effectText, effect);

						response += "\n\n" + effectText;
						ship.effectChange(effect);

						panel.destroy();					
						messageActive = false;

						response = playState.swapNames(response);

						playState.displayMessageNoChoice(messageBox.title, response, "Continue the journey");
					});

				} else {
					
					var selectedOption = messageBox.options[e];

					button.events.onInputUp.add(function () {

						sound_select.play();

						//There's no dice roll needed here. 

						panel.destroy();

						messageActive = false;
						
						var response = "Response not set!";
						var effect = "Effect not set!";
						var effectText = "";
	
						messageActive = false;

						response = playState.swapNames(response);

						effect = selectedOption.effect;
						
						if (effect != null) {
							//Parse some JSON:
							effectText = playState.parseEffectText(effectText, effect);

							response += "\n\n" + effectText;

							ship.effectChange(effect);
						} else {
							console.log("Effect is null.");
						}
						
						
						if (!option.final) {
							//option.final is just a flag to note whether this is the last dialog box in a sequence.
							playState.displayMessageNoChoice(messageBox.title, option.response, "Continue the journey");
						}

					});
				}
				
			})(i); //End of anonymous wrapper
			
		}
    },
	
    createMessageBoxEndgame: function() {
		
		messageActive = true;
        var x = 84 * scale;
        var y = 7 * scale;
        var panel;
        slickUI.add(panel = new SlickUI.Element.Panel(x, y, 164 * scale, 84 * scale));
		
        messageBox.content = playState.swapNames(messageBox.content);
        
        panel.add(new SlickUI.Element.Text(2 * scale, 0, messageBox.title)).centerHorizontally();
        panel.add(new SlickUI.Element.Text(2 * scale, 12 * scale, messageBox.content));
        
		for (var i = 0; i < messageBox.options.length; i++) {
			var button;
			var option = messageBox.options[i];
			
            if (messageBox.options.length == 1) {
                panel.add(button = new SlickUI.Element.Button(0, 50 * scale + i * 14 * scale + 50, 164 * scale, 14 * scale));
            } else {
                panel.add(button = new SlickUI.Element.Button(0, 50 * scale + i * 14 * scale, 164 * scale, 14 * scale));
            }
			button.add(new SlickUI.Element.Text(0,0, playState.swapNames(option.choice))).center();
				
			button.events.onInputUp.add(function () {

				sound_select.play();

				panel.destroy();

				messageActive = false;
				
                //refresh the page to start the game again
				window.location.reload();
			});
			
		}
    },
	
	/* TESTING FOR THE JSON INTERPRETER */
	
	JSONtest: function() {
		data_eventsStory = game.cache.getJSON('data_eventsStory');
		console.log(data_eventsStory);
	},
    
    /* Events loaded from JSON data */
    
    fireEvent_Danger: function(danger) {
        
        ship.needsRecharge = true;
        
        //Danger events are system-dependent, so pull the event from a JSON file,
        //looking it up by the tag attached to the mapData object. E.g. "danger": "ASTEROIDS" or "danger": "MILITARY"
        
        //Danger events, when complete, require you to recharge your jump drive before you can jump again.
        //Recharging should play a visual effect (like jumping does - or will, rather) and then fire a story event.
		
		/*
		
		Danger events happen immediately after landing in a system. They present some dangerous situation the player has to
		try and resolve, using logic and reasoning.
		
		Story events happen the day after, under the assumption that the crew has slept while the jump drive recharged. They
		present moral challenges, which the player must deal with on an emotional level. (Hopefully.)
		
		Danger events should make good use of dice rolls and chance, whereas story events should have persistent effects on
		the future of the game.
		
		*/
		
		data_eventsDanger = game.cache.getJSON('data_eventsDanger');
		
		var selector = Math.floor(Math.random() * data_eventsDanger.length);
		
		var relevantEvents = [];
		var j = 0;
		var eventToFire;
		
		if (testing) {
			//This is for testing specific danger events. Saves time.
			
			for (var i = 0; i < data_eventsDanger.length; i++) {
				if (data_eventsDanger[i].name == eventToTest) {
					eventToFire = data_eventsDanger[i];
				}
			}
			
			if (eventToFire == undefined) {
				console.log("Couldn't find test subject " + eventToTest + " in story events list.");
			} else {
				console.log("Testing danger event: " + eventToFire.name);
			}
			
		} else {
			
			for (var i = 0; i < data_eventsDanger.length; i++) {

				var encounter = data_eventsDanger[i];

				if (encounter.dangerType == danger) {
					relevantEvents[j] = encounter;
					j++;
				}

			}

			var selector = Math.floor(Math.random() * relevantEvents.length);

			eventToFire = relevantEvents[selector];

			console.log("Firing danger event: " + eventToFire.name);
		}
		
		this.displayMessage(eventToFire.title, eventToFire.content, eventToFire.options);
        
    },
    
    fireEvent_Story: function() {
		
		data_eventsStory = game.cache.getJSON('data_eventsStory');
		
		var selector = Math.floor(Math.random() * data_eventsStory.length);
		
		var encounter = data_eventsStory[selector];
		
		if (testing) {
			//This is for testing specific story events. Saves time.
			
			for (var i = 0; i < data_eventsStory.length; i++) {
				if (data_eventsStory[i].name == eventToTest) {
					encounter = data_eventsStory[i];
				}
			}
			
			if (encounter == undefined) {
				console.log("Couldn't find test subject " + eventToTest + " in story events list.");
			} else {
				console.log("Testing story event: " + encounter.name);
			}
			
		} else {
			console.log("Firing story event: " + encounter.name);
		}
		
		this.displayMessage(encounter.title, encounter.content, encounter.options);
        
        //Story events, when complete, allow you to jump to another system.
    },
    
    setWarning: function(warning) {
        warning_current.visible = false;
        warning_current = warning;
        warning_current.visible = true;
    },
    
    recharge: function() {
		
		if (!ship.needsRecharge) {
			console.log("JUMP DRIVE ALREADY CHARGED");
			sound_selectFail.play();
			return;
		}
		
		if (messageActive) {
			console.log("CANNOT RECHARGE - STUFF IS HAPPENING");
			sound_selectFail.play();
			return;
		}
		
        ship.needsRecharge = false;
		
		messageActive = true;	//The message isn't active just yet, but we don't want anything to prevent it displaying.
		
        playState.setWarning(warnings.sprite_driveReady);
		
		ship.sprite.animations.play('anim_ship_charge', 16, false);
        sound_beam.play();
    },
    
	jump: function() {
		
		if (ship.needsRecharge) {
			console.log("CANNOT JUMP - JUMP DRIVE DRAINED");
			sound_selectFail.play();
			return;
		}
		
		if (messageActive) {
			console.log("CANNOT JUMP - STUFF IS HAPPENING");
			sound_selectFail.play();
			return;
		}
		
        ship.sprite.animations.play('anim_ship_jump', 16, false);
        sound_jump2.play();
		
	},
    
	engineer: function() {
        
        sound_select.play();
		
		game.state.start('combat');
	},
    
	manageCrew: function() {
        
        sound_select.play();
		
		var crewPanelX = 32;
		var crewPanelY = 32 + 8;
		var crewPanelWidth = 256 * 2;
		var crewPanelHeight = 180;
		
		//slickUI.add(crewPanel = new SlickUI.Element.Panel(crewPanelX, crewPanelY, crewPanelWidth, crewPanelHeight));
		
	},
    
    swapNames: function(text) {
        
        //Swap out the nametags in a string with the player-set character names (or defaults)
        //Positions are in the format NAME_JOBTITLE
        //Jobtitles are PILOT, NAVIGATOR, ENGINEER, SECURITY
        
        var result = text;
        
        result = result.replace("[NAME_PILOT]", ship.name_Pilot);
        result = result.replace("[NAME_ENGINEER]", ship.name_Engineer);
        result = result.replace("[NAME_NAVIGATOR]", ship.name_Navigator);
        result = result.replace("[NAME_SECURITY]", ship.name_Security);
        
        return result;
    },
    
    initUI: function() {
        
        var statusPanel;
        var barX = 0;
        var barY = 99 * scale;
        slickUI.add(statusPanel = new SlickUI.Element.Panel(barX, barY, game.width, game.height));

        var hudPanel;
        statusPanel.add(hudPanel = new SlickUI.Element.DisplayObject(3 * scale, 1 * scale, game.make.sprite(0, 0, 'hud_panel')));
        
		//Warning lights on HUD panel
		slickUI.add(warnings.sprite_driveCharge = new SlickUI.Element.DisplayObject(barX + 16, barY + 10, game.make.sprite(0, 0, 'hud_driveCharge')));
		slickUI.add(warnings.sprite_driveReady = new SlickUI.Element.DisplayObject(barX + 16, barY + 10, game.make.sprite(0, 0, 'hud_driveReady')));
		warnings.sprite_driveCharge.visible = false;
		warnings.sprite_driveReady.visible = false;

        var jumpButton = statusPanel.add(new SlickUI.Element.Button(31 * scale, 2 * scale, 24 * scale, 10 * scale));
		jumpButton.add(new SlickUI.Element.Text(0, 0, "JUMP")).center();
        jumpButton.events.onInputUp.add(this.jump);
        
        var rechargeButton = statusPanel.add(new SlickUI.Element.Button(31 * scale, 13 * scale, 24 * scale, 10 * scale));
		rechargeButton.add(new SlickUI.Element.Text(0, 0, "CHRG")).center();
        rechargeButton.events.onInputUp.add(this.recharge);
        
        var engineerButton = statusPanel.add(new SlickUI.Element.Button(58 * scale, 2 * scale, 24 * scale, 10 * scale));
		engineerButton.add(new SlickUI.Element.Text(0, 0, "ENGI")).center();
        engineerButton.events.onInputUp.add(this.engineer);
        
        var crewButton = statusPanel.add(new SlickUI.Element.Button(58 * scale, 13 * scale, 24 * scale, 10 * scale));
		crewButton.add(new SlickUI.Element.Text(0, 0, "SOON")).center();
        crewButton.events.onInputUp.add(this.manageCrew);
        
        var mineButton = statusPanel.add(new SlickUI.Element.Button(85 * scale, 2 * scale, 24 * scale, 10 * scale));
		mineButton.add(new SlickUI.Element.Text(0, 0, "MORE")).center();
        mineButton.events.onInputUp.add(this.engineer);
        
        var scanButon = statusPanel.add(new SlickUI.Element.Button(85 * scale, 13 * scale, 24 * scale, 10 * scale));
		scanButon.add(new SlickUI.Element.Text(0, 0, "PLS")).center();
        scanButon.events.onInputUp.add(this.manageCrew);
        
        var feckButton = statusPanel.add(new SlickUI.Element.Button(112 * scale, 2 * scale, 24 * scale, 10 * scale));
		feckButton.add(new SlickUI.Element.Text(0, 0, "BITS")).center();
        feckButton.events.onInputUp.add(this.engineer);
        
        var arseButton = statusPanel.add(new SlickUI.Element.Button(112 * scale, 13 * scale, 24 * scale, 10 * scale));
		arseButton.add(new SlickUI.Element.Text(0, 0, "WAIT")).center();
        arseButton.events.onInputUp.add(this.manageCrew);
		
        label_STAT = statusPanel.add(new SlickUI.Element.Text(199 * scale, 0 * scale, "STAT"));
		label_FUEL = statusPanel.add(new SlickUI.Element.Text(164 * scale, 8 * scale, "FUEL: " + ship.fuel + "KT"));
		label_CREW = statusPanel.add(new SlickUI.Element.Text(164 * scale, 14 * scale, "CREW: " + ship.crew));
		label_HAPP = statusPanel.add(new SlickUI.Element.Text(208 * scale, 8 * scale, "HAPP: " + ship.happiness + "%"));
		label_HULL = statusPanel.add(new SlickUI.Element.Text(208 * scale, 14 * scale, "HULL: " + ship.hull + "%"));
        
        var fullScreenButton;
        slickUI.add(fullScreenButton = new SlickUI.Element.Button(0, 0, 32, 32));
        fullScreenButton.events.onInputUp.add(function () {playState.fullScreenToggle();});
        fullScreenButton.add(new SlickUI.Element.Text(0,0, "[]")).center();
    },
	
	win: function() {
		console.log("WIN");
		
		this.displayMessageEndgame("SUCCESS", "The pods detach and begin their descent to the surface. You made it. " + ship.crew + " humans will have a chance to start over.\n\nGAME OVER", "Reflect on the journey.");
	},
	
	lose: function() {
		console.log("LOSE");
		
		this.displayMessageEndgame("FAILURE", "Through incompetence, malice or just plain bad luck, the human race has been extinguished. Good riddance.\n\nGAME OVER", "Reflect on your mistakes.");
	},
	
	refreshStatusPanel: function() {
        label_FUEL.text.text = "FUEL: " + ship.fuel + "KT";
        label_CREW.text.text = "CREW: " + ship.crew;
        label_HAPP.text.text = "HAPP: " + ship.happiness + "%";
        label_HULL.text.text = "HULL: " + ship.hull + "%";
	},
    
    fullScreenToggle: function() {
        
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        if (game.scale.isFullScreen)
        {
            game.scale.stopFullScreen();
        }
        else
        {
            game.scale.startFullScreen(false);
        }
    }
	
};