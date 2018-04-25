/* COMBAT VARIABLES */
    
var enemyInfo = {
    bulletSpeed: 60,
    bulletSpread: 15,
    moveSpeed: 62,
    bulletInterval_min: 4,
    bulletInterval_max: 8
};

var endZone;

var states = ['incomplete', 'win', 'lose'];

var battleStatus = states[0];

var combatState = {
    
	preload: function() {
		groupBackground = game.add.group();
		groupEnemies = game.add.group();
        groupShip = game.add.group();
		groupTargets = game.add.group();
		groupExplosions = game.add.group();
		var playerShip;
		
		
		//Slick UI library
		slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
		slickUI.load('res/ui/kenney/kenney.json');
	},
	
	//4 weapon slots - 1, 2, 3, 4
	
	currentWeaponSlot: 1,
	fireEnabled: false,
	
	enemies: [],
	
	create: function () {

    	game.physics.startSystem(Phaser.Physics.ARCADE);
		
		//Initialise scenery & objects
        playerShip = game.add.sprite(108 * scale, 100 * scale, 'anim_ship');
		game.physics.arcade.enable(playerShip);
		
        var animIdle = playerShip.animations.add('anim_ship_idle', [0,1,2,3,4,5,6,7]);
        var animJump = playerShip.animations.add('anim_ship_jump', [8,9,10,11]);
        var animLand = playerShip.animations.add('anim_ship_land', [11,10,9,8]);
        var animCharge = playerShip.animations.add('anim_ship_charge', [12,13,14,15]);
        
        playerShip.animations.play('anim_ship_idle', 8, true);
		
		groupBackground.create(0, 0, 'bg_starField');
		
		for (var i = 0; i < 8; i++) {
			this.spawnEnemy();
		}
		
        groupBackground.scale.set(scale);
        playerShip.scale.set(scale);
        groupEnemies.scale.set(scale);
		groupTargets.scale.set(scale);
		groupExplosions.scale.set(scale);
		
		//UI
		
        var weaponsPanel;
        var barX = 0;
        var barY = 0;
        slickUI.add(weaponsPanel = new SlickUI.Element.Panel(barX, barY, 21 * scale, 14 * scale));
        var button1 = weaponsPanel.add(new SlickUI.Element.Button(0 * scale, 2 * scale, 8 * scale, 8 * scale));
		button1.add(new SlickUI.Element.Text(0, 0, "1")).center();
        button1.events.onInputUp.add(function(){combatState.currentWeaponSlot = 1; combatState.fireEnabled = false;});
        var button2 = weaponsPanel.add(new SlickUI.Element.Button(10 * scale, 2 * scale, 8 * scale, 8 * scale));
		button2.add(new SlickUI.Element.Text(0, 0, "2")).center();
        button2.events.onInputUp.add(function(){combatState.currentWeaponSlot = 2; combatState.fireEnabled = false;});
		
		
		//WEAPON SLOT 1
		playerShip.weaponMissile = game.add.weapon(30, 'img_missile');
		playerShip.weaponMissile.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		playerShip.weaponMissile.bulletSpeed = 400;
		playerShip.weaponMissile.fireRate = 1200;
		playerShip.weaponMissile.trackSprite(playerShip, 32, 16, false);
		
		//WEAPON SLOT 2
		playerShip.weaponRail = game.add.weapon(30, 'img_rail');
		playerShip.weaponRail.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		playerShip.weaponRail.bulletSpeed = 1000;
		playerShip.weaponRail.fireRate = 1200;
		playerShip.weaponRail.trackSprite(playerShip, 32, 16, false);
	},
	
	update: function() {
		
		
		//ENEMY AI & COLLISION CODE
		
		this.enemies.forEach(function (enemy, i) {
			
			enemy.y += enemyInfo.moveSpeed * game.time.physicsElapsed;
			
			game.physics.arcade.collide(enemy.weapon.bullets, this.playerShip, function(obj1, obj2){
				//Enemy bullet collides with player ship
				obj1.kill();
				obj2.kill();
				combatState.spawnExplosion(obj2.x/scale -16, obj2.y/scale - 8);
				combatState.spawnGibs();
				
				battleStatus = states[2];	//2 is 'lose'
				console.log("Battlestatus is " + battleStatus);
			});
			
			game.physics.arcade.overlap(enemy.weapon.bullets, groupExplosions, function(obj1, obj2){
				//Enemy bullet collides with explosion
				obj1.kill();
			});
			
			enemy.fireTimer -= game.time.physicsElapsed;
			if (enemy.fireTimer <= 0) {
				if (enemy.alive) {
					enemy.fire();
					enemy.fireTimer = Math.floor(Math.random() * enemyInfo.bulletInterval_max) + enemyInfo.bulletInterval_min;
				}
			}
			
			
			if (enemy.y > 128) {
				enemy.kill();
				combatState.enemies.splice(i, 1); //this is so bugged - it removes the enemy but not their bullet pool but does stop collision checking on the bullets
			}
			
		});
		
		if (combatState.enemies.length < 1) {
			if (battleStatus === 'incomplete') {
				battleStatus = states[1];	//1 is 'win' - this doesn't trigger
			}
		}
		
		game.physics.arcade.collide(playerShip.weaponMissile.bullets, groupTargets, function(obj1, obj2)
		{
			obj1.kill(); obj2.kill(); combatState.spawnExplosion(obj1.x/scale - 16, obj1.y/scale - 16);
		}); //16 is half the width of the explosion sprite
		
		game.physics.arcade.collide(playerShip.weaponRail.bullets, groupEnemies, function(obj1, obj2){obj2.kill();});


		
		//INPUT CODE
		
		if (game.input.activePointer.isDown)
		{
			if (this.fireEnabled && playerShip.alive) {
				
				if (this.currentWeaponSlot === 1) {
					var didFire = playerShip.weaponMissile.fireAtPointer();

					if (didFire) {
						var reticle = groupTargets.create(game.input.x/scale - 2, game.input.y/scale - 2, 'img_reticle');
						game.physics.arcade.enable(reticle, Phaser.Physics.ARCADE);
					}
				} else if (this.currentWeaponSlot === 2) {
					playerShip.weaponRail.fireAtPointer();
				}
			} else {
				this.fireEnabled = true;
			}

		}
		
		game.world.bringToTop(groupExplosions);
	},
	
	render: function() {
		
	},
	
	spawnEnemy: function() {
		
		var randomX = Math.floor(Math.random() * 150);
		
		//This is a trick to make sure enemies don't spawn on a player collision course
		if (randomX > 60)
			randomX += Math.floor(Math.random() * 100) + 100;
		
		var randomY = Math.floor(Math.random() * 100) - 110;
		
		var posX = randomX;
		var posY = randomY;
		
        var enemy = groupEnemies.create(posX, posY, 'img_enemy');
		
		enemy.fireTimer = Math.floor(Math.random() * 2) + 2;
		
		enemy.weapon = game.add.weapon(30, 'img_laser');
		enemy.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		enemy.weapon.bulletSpeed = enemyInfo.bulletSpeed;
		enemy.weapon.trackSprite(enemy, 32, 32, false);
		enemy.weapon.bulletAngleVariance = enemyInfo.bulletSpread;
		
		enemy.fire = function() {
			this.weapon.fireAtSprite(playerShip);
		}
		
		game.physics.arcade.enable(enemy, Phaser.Physics.ARCADE);
		enemy.body.setSize(enemy.width * scale, enemy.height * scale)
		this.enemies.push(enemy);
		
	},
	
	killBoth: function(object1, object2) {
		object1.kill();
		object2.kill();
	},
	
	spawnExplosion: function(x, y) {
		var explosion = groupExplosions.create(x, y, 'anim_explosion');
        var explosionAnim = explosion.animations.add('anim_splode', [3, 4, 5, 6]);
        explosion.animations.play('anim_splode', 24, true, true);
		game.physics.arcade.enable(explosion);
		explosion.body.setSize(explosion.width * scale, explosion.height * scale)
		explosion.lifespan = 600;
		explosion.body.immovable = true;
		explosion.body.setCircle();
		
		sound_laserExplosion1.play();
	},
	
	spawnExplosion2: function(x, y) {
		var explosion = groupExplosions.create(x, y, 'anim_explosion');
        var explosionAnim = explosion.animations.add('anim_splode', [0,1,2,3,4,5,6,7,8]);
        explosion.animations.play('anim_splode', 20, false);
		game.physics.arcade.enable(explosion);
		explosion.body.setSize(explosion.width * scale, explosion.height * scale)
		explosion.lifespan = 280;
		explosion.body.immovable = true;
		explosion.body.setCircle();
		
		sound_laserExplosion1.play();
	},
	
	
	spawnGibs: function() {
		
        var gib0 = game.add.sprite((108 - 6) * scale, 100 * scale + 8, 'img_ship_gib0');
        var gib1 = game.add.sprite((108 + 6) * scale, 100 * scale + 8, 'img_ship_gib1');
        var gib2 = game.add.sprite((108 + 22) * scale, 100 * scale + 8, 'img_ship_gib2');
		
		gib0.scale.set(scale);
		gib1.scale.set(scale);
		gib2.scale.set(scale);
		
		game.physics.arcade.enable(gib0);
		game.physics.arcade.enable(gib1);
		game.physics.arcade.enable(gib2);

        gib0.body.velocity = new Phaser.Point(-15, 0);;
        gib1.body.velocity = new Phaser.Point(0, -5);;
        gib2.body.velocity = new Phaser.Point(20, -6);;
		
        gib0.body.angularVelocity = -5;
        gib1.body.angularVelocity = -2;
        gib2.body.angularVelocity = +8;
		
	}
};