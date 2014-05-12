
var GRID_WIDTH = GRID_SIZE;
var GRID_HEIGHT = GRID_SIZE;

var GameData = cc.Class.extend({
    nodeParent: null,
    gameGrid: null
});

var GameRules = cc.Class.extend({

    _gameData: null,
    _score:0,

    init: function(gameData) {

        this._gameData = gameData;

        // Add some apples
        var col = cc.color(255, 0, 0, 255);
        for (var i = 0; i < 10; i++) {
            var p = gameData.gameGrid.getRandomOpenPos();
            var apple = new Apple(gameData.nodeParent, gameData.gameGrid, p);
        }
    },

    onEat: function() {

    }
});

var SingleAppleRules = GameRules.extend({

    init: function(gameData) {

        this._gameData = gameData;

        this.spawnApple(); // Initializes first apple
    },

    onEat: function() {

        this._score++;
        this.spawnApple();
    },

    spawnApple: function() {
        var p = this._gameData.gameGrid.getRandomOpenPos();
        var apple = new Apple(this._gameData.nodeParent, this._gameData.gameGrid, p);
    }

});
