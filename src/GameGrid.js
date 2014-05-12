
var GameGrid = cc.Class.extend({

    _gameGrid: null,

    ctor:function() {
        this._gameGrid = {};
    },

    posHash:function(pos) {
        return pos.x + ',' + pos.y;
    },

    get:function(pos) {
        return this._gameGrid[this.posHash(pos)];
    },

    set:function(pos, val) {
        this._gameGrid[this.posHash(pos)] = val;
    },

    getRandomOpenPos:function() {

        var p = null;
        do {
            p = cc.p(Math.round(Math.random() * (GRID_WIDTH - 3)) + 1,
                    Math.round(Math.random() * (GRID_HEIGHT - 3)) + 1);
        } while (this.get(p));

        return p;
    }

});
