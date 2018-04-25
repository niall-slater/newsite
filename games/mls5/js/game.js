var scale = 3;

var game = new Phaser.Game(256 * scale, 128 * scale, Phaser.AUTO, 'game', false, false);

game.antialias=false;

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('map', mapState);
game.state.add('combat', combatState);
game.state.add('win', winState);

game.state.start('boot');

var mapData;