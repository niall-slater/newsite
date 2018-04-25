var welcomePanel;
var settingsPanel;
var creditsPanel;


/* GLOBAL AUDIO REFERENCES */
var music;

var sound_jump;
var sound_jump2;
var sound_buoy;
var sound_signal;
var sound_select;
var sound_selectFail;
var sound_beep;
var sound_land;
var sound_beam;
var sound_laserExplosion0;
var sound_laserExplosion1;

var menuState = {
	
	preload: function() {
        music = game.add.audio('music_airshipSerenity');
		
		sound_jump = game.add.audio('sound_jump');
		sound_jump2 = game.add.audio('sound_jump2');
		sound_buoy = game.add.audio('sound_buoy');
		sound_signal = game.add.audio('sound_signal');
		sound_select = game.add.audio('sound_select');
		sound_selectFail = game.add.audio('sound_selectFail');
		sound_beep = game.add.audio('sound_beep');
		sound_land = game.add.audio('sound_land');
		sound_beam = game.add.audio('sound_beam');
		sound_laserExplosion0 = game.add.audio('sound_laserExplosion0');
		sound_laserExplosion1 = game.add.audio('sound_laserExplosion1');
	},
	
	create: function() {
		music.play("", 0, 0, true, false);
		
        //Slick UI library
        slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
        slickUI.load('res/ui/kenney/kenney.json');
		
        var panel;
		
        slickUI.add(panel = new SlickUI.Element.Panel(48, 48, 320, 240));
		
		//Add title and content
        panel.add(new SlickUI.Element.Text(12, 0, "Miserable Life, Space", 16));
        panel.add(new SlickUI.Element.Text(12, 38, "A game about choices", 16));
		
		var startButton;
		panel.add(startButton = new SlickUI.Element.Button(4, 88, 300, 44));
		startButton.add(new SlickUI.Element.Text(0,0, "Start Game")).center();
        startButton.events.onInputUp.add(this.start);
        
		var settingsButton;
		panel.add(settingsButton = new SlickUI.Element.Button(4, 88 + 48, 300, 44));
		settingsButton.add(new SlickUI.Element.Text(0,0, "Settings")).center();
        settingsButton.events.onInputUp.add(this.settings);
		
		var creditsButton;
		panel.add(creditsButton = new SlickUI.Element.Button(4, 88 + 48 + 48, 300, 44));
		creditsButton.add(new SlickUI.Element.Text(0,0, "Credits")).center();
        creditsButton.events.onInputUp.add(this.credits);
        
        slickUI.add(welcomePanel = new SlickUI.Element.Panel(48 + 320 + 40, 48, 320, 240));
        
        var welcomeText;
        
        welcomePanel.add(welcomeText = new SlickUI.Element.Text(8, 4, "Welcome to MLS.", 24));
        welcomePanel.add(welcomeText = new SlickUI.Element.Text(8, 44, "You're the captain of a generation ship carrying Earth's last humans. Can you find a new home?\n\nVery WIP. Bug reports to contact@niallslater.com.", 16));
        
        slickUI.add(creditsPanel = new SlickUI.Element.Panel(48 + 320 + 40, 48, 320, 240));
        
        var closeCreditsButton;
        creditsPanel.add(closeCreditsButton = new SlickUI.Element.Button(320-32, 0, 16, 16));
        closeCreditsButton.events.onInputUp.add(function () {menuState.closeCredits();});
        closeCreditsButton.add(new SlickUI.Element.Text(0,0, "x", 8)).center();
        
        creditsPanel.visible = false;
        
        slickUI.add(settingsPanel = new SlickUI.Element.Panel(48 + 320 + 40, 48, 320, 280));
        
        var nameField_Pilot;
        var label_Pilot;
        settingsPanel.add(label_Pilot = new SlickUI.Element.Text(8, 2, "Pilot name:", 12));
		settingsPanel.add(nameField_Pilot = new SlickUI.Element.TextField(4, 24, 140, 44, 14));
        nameField_Pilot.text.text.text = ship.name_Pilot;
        nameField_Pilot.events.onKeyPress.add(function() {ship.name_Pilot = nameField_Pilot.value;});
        
        var nameField_Engineer;
        var label_Engineer;
        settingsPanel.add(label_Engineer = new SlickUI.Element.Text(8, 2 + 64, "Engineer name:", 12));
		settingsPanel.add(nameField_Engineer = new SlickUI.Element.TextField(4, 24 + 64, 140, 44, 14));
        nameField_Engineer.text.text.text = ship.name_Engineer;
        nameField_Engineer.events.onKeyPress.add(function() {ship.name_Engineer = nameField_Engineer.value;});
        
        var nameField_Navigator;
        var label_Navigator;
        settingsPanel.add(label_Navigator = new SlickUI.Element.Text(8 + 140, 2, "Navigator name:", 12));
		settingsPanel.add(nameField_Navigator = new SlickUI.Element.TextField(8 + 140, 24, 140, 44, 14));
        nameField_Navigator.text.text.text = ship.name_Navigator;
        nameField_Navigator.events.onKeyPress.add(function() {ship.name_Navigator = nameField_Navigator.value;});
        
        var nameField_Security;
        var label_Security;
        settingsPanel.add(label_Security = new SlickUI.Element.Text(8 + 140, 2 + 64, "Security name:", 12));
		settingsPanel.add(nameField_Security = new SlickUI.Element.TextField(8 + 140, 24 + 64, 140, 44, 14));
        nameField_Security.text.text.text = ship.name_Security;
        nameField_Security.events.onKeyPress.add(function() {ship.name_Security = nameField_Security.value;});
        
        var volumeSlider;
        var label_Volume;
        settingsPanel.add(label_Volume = new SlickUI.Element.Text(8, 2 + 64 + 64 + 12, "Music volume:", 12));
		settingsPanel.add(volumeSlider = new SlickUI.Element.Slider(16, 2 + 64 + 64 + 50, 256));
        
        volumeSlider.onDrag.add(function (value) {
            var setting = value;
            music.volume = setting;
        });
        
        var closeSettingsButton;
        settingsPanel.add(closeSettingsButton = new SlickUI.Element.Button(320-32, 0, 16, 16));
        closeSettingsButton.events.onInputUp.add(function () {menuState.closeSettings();});
        closeSettingsButton.add(new SlickUI.Element.Text(0,0, "x", 8)).center();
        
        settingsPanel.visible = false;
	},
	
	start: function() {
		sound_select.play();
		encounterCounter = 0;
		game.state.start('play');
	},
	
    settings: function() {
		sound_select.play();
        creditsPanel.visible = false;
        settingsPanel.visible = true;
    },
    
    closeSettings: function() {
		sound_select.play();
        settingsPanel.visible = false;
    },
    
    credits: function() {
		sound_select.play();
        settingsPanel.visible = false;
        creditsPanel.visible = true;
    },
    
    closeCredits: function() {
		sound_select.play();
        creditsPanel.visible = false;
    }
    
};