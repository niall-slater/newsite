var data_eventsStory;
var data_eventsDanger;
var encounterCounter;



var loadState = {
	
	preload: function() {
		
		var loadingLabel = game.add.text(80, 150, "loading...", {font: "30px Arial", fill: "#fff"});
		
        
		/* SPRITES */
		
		//Scenery & Objects
		game.load.image('bg_starField', 'res/scenery/bg_starField.png');
		game.load.image('img_ship', 'res/ships/img_ship.png');
		game.load.image('img_enemy', 'res/ships/img_enemy.png');
		
		
		game.load.image('img_ship_gib0', 'res/ships/gibs/img_ship_gib0.png');
		game.load.image('img_ship_gib1', 'res/ships/gibs/img_ship_gib1.png');
		game.load.image('img_ship_gib2', 'res/ships/gibs/img_ship_gib2.png');
		
		game.load.image('img_laser', 'res/ships/img_laser.png');
		game.load.image('img_missile', 'res/ships/img_missile.png');
		game.load.image('img_reticle', 'res/ships/img_reticle.png');
		game.load.image('img_rail', 'res/ships/img_rail.png');
		
        game.load.image('hud_driveReady', 'res/ui/hud_driveReady.png');
        game.load.image('hud_driveCharge', 'res/ui/hud_driveCharge.png');
        game.load.image('hud_panel', 'res/ui/hud_panel.png');
        
        
        for (var i = 0; i < 6; i++) {
            game.load.image('img_scenery_' + i, 'res/scenery/img_scenery_' + i + '.png');
        }
		
        //Map screen
        game.load.image('bg_map', 'res/ui/bg_map.png');
        for (var i = 0; i < 6; i++) {
            game.load.image('icon_planet' + i, 'res/ui/icon_planet' + i + '.png');
        }
        game.load.image('icon_planet_selector', 'res/ui/icon_planet_selector.png');
        game.load.image('icon_planet_highlight', 'res/ui/icon_planet_highlight.png');
		
        game.load.image('warning_lowFuel', 'res/ui/warning_lowFuel.png');
        game.load.image('warning_noFuel', 'res/ui/warning_noFuel.png');
		
        game.load.image('icon_asteroids', 'res/ui/icon_asteroids.png');
        game.load.image('icon_military', 'res/ui/icon_military.png');
        game.load.image('icon_ion', 'res/ui/icon_ion.png');
        
        //Animations
        game.load.spritesheet('anim_ship', 'res/ships/anim_ship_32x16.png', 32, 16);
        game.load.spritesheet('anim_explosion', 'res/ships/anim_explosion_32x32.png', 32, 32);
        
		/* AUDIO */
		game.load.audio('music_airshipSerenity', 'res/audio/Airship Serenity.mp3');
		game.load.audio('sound_jump', 'res/audio/jump.ogg');
		game.load.audio('sound_jump2', 'res/audio/jump2.ogg');
		game.load.audio('sound_buoy', 'res/audio/buoy.ogg');
		game.load.audio('sound_signal', 'res/audio/signal.ogg');
		game.load.audio('sound_select', 'res/audio/select.ogg');
		game.load.audio('sound_selectFail', 'res/audio/selectFail.ogg');
		game.load.audio('sound_beep', 'res/audio/beep.ogg');
		game.load.audio('sound_land', 'res/audio/land.ogg');
		game.load.audio('sound_beam', 'res/audio/beam.ogg');
		game.load.audio('sound_laserExplosion0', 'res/audio/laserExplosion0.ogg');
		game.load.audio('sound_laserExplosion1', 'res/audio/laserExplosion1.ogg');
		
		
		/* UI */
		
        //Slick UI library
        slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
        slickUI.load('res/ui/kenney/kenney.json');
		
		/* DATA */
		
		//Data
		game.load.json("data_eventsStory", "res/data/data_eventsStory.json");		//TODO: randomise event lists at start of game and iterate through to prevent repetition
		game.load.json("data_eventsDanger", "res/data/data_eventsDanger.json");
		game.load.json("data_map", "res/data/data_map.json");
        
        mapData = {
            systems : undefined,
            shipPosition : undefined
        };
        
        
	},
	
	create: function() {
        mapData.systems = game.cache.getJSON('data_map');
        
		//shipPosition is an integer corresponding to the index of the current system in mapData.systems
		mapData.shipPosition = 0;
		
		//Shuffle the encounter list
		
		
		game.state.start('menu');
	}
	
};