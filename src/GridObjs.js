var GRID_PITCH = 1;
var GRID_SIZE = 32;

var GridObj = cc.Class.extend( {

    _color: cc.color._getOrange(),
    _position: cc.p(0, 0), /**< Position on the grid */
    _node: null,
    _parentNode: null,
    _gameGrid: null,

    ctor:function(parentNode, grid, pos) {

        this._parentNode = parentNode;
        this._gameGrid = grid;

        //var font = cc.LabelBMFont.create('.', res.visitor_fnt); //cc.DrawNode.create();
        var sprite = cc.Sprite.create(res.pixel_png);
        //sprite.setTextureRect(cc.rect(0, 0, 1, 1));
        sprite.setAnchorPoint(cc.p(0, 0));
        this._node = sprite;
        this._node.setColor(this._color);
        //this._node.drawRect(cc.p(0, 0), cc.p(GRID_PITCH, GRID_PITCH), this._color, 0, cc.color(0, 0, 0, 0));// this._color);
        //this._node.drawDot(cc.p(0, 0), 1, this._color);
        this.setGridPos(pos);
        parentNode.addChild(this._node);

        //cc.log('New GridObj');
    },
    getGridPos:function() {
        return this._position;
    },
    setGridPos:function(pos) {
        this._position = pos;
        this._gameGrid.set(pos, this);
        this._node.setPosition(this.getPointPos());
    },
    moveTo:function(pos) {
        this._gameGrid.set(this._position, null);
        this.setGridPos(pos);
    },
    getPointPos:function() {
        //return cc.p(this._position.x * GRID_PITCH, this._position.y * GRID_PITCH);
        return this._position;
    },
    destroy:function() {
        this._gameGrid.set(this._position, null);
        this._parentNode.removeChild(this._node);
    }
});

var GridObstacle = GridObj.extend({

    _color: cc.color._getGray()
});

var SnakeBody = GridObj.extend({
    _color: cc.color._getGreen()
});

var Apple = GridObj.extend({

    _color: cc.color._getRed(),

    ctor:function(parentNode, grid, pos) {
        this._super(parentNode, grid, pos);
        //cc.log('made an APPLE');
    }
});
