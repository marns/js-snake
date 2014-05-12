var ticks = 0;

var SnakeGameLayer = cc.Layer.extend({
    _snakeBody:null, // empty array/object initializers aren't reset for new instances(!!)
    _gameRules:null,
    _gameGrid:null,
    _dir:cc.p(0, 1),
    _nextDir:cc.p(0, 1),
    _pos:cc.p(GRID_SIZE/2, 1),
    _headIdx:-1,
    _renderTex:null,
    _scoreboard:null,
    _hideScoreTime:0,
    ctor:function () {

        this._super();
        this._snakeBody = [];
        this._gameGrid = new GameGrid();
        this._gameRules = new SingleAppleRules();

        ticks = 0;

        var size = cc.director.getWinSize();

        // Bind keyboard input
        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            var local = this;
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (key == cc.KEY.left && local._dir.x != 1) {
                        local._nextDir = cc.p(-1, 0);
                    } else if (key == cc.KEY.right && local._dir.x != -1) {
                        local._nextDir = cc.p(1, 0);
                    } else if (key == cc.KEY.up && local._dir.y != -1) {
                        local._nextDir = cc.p(0, 1);
                    } else if (key == cc.KEY.down && local._dir.y != 1) {
                        local._nextDir = cc.p(0, -1);
                    }
                }
            }, this);
        }

        var background = cc.LayerColor.create(cc.color(40, 40, 40, 255));
        //this.addChild(background);

        // Setup 32x32 render target
        this._renderTex = cc.RenderTexture.create(32, 32);
        this._renderTex.x = size.width / 2;
        this._renderTex.y = size.height / 2;

        this._renderTex.addChild(background, 0);

        var gameData = new GameData();
        gameData.nodeParent = this._renderTex;
        gameData.gameGrid = this._gameGrid;

        this._gameRules.init(gameData);

        // Build walls
        //var GRID_WIDTH = (size.width-GRID_SIZE)/GRID_PITCH;
        //var GRID_HEIGHT = (size.height-GRID_SIZE)/GRID_PITCH;
        var GRID_WIDTH = GRID_SIZE;
        var GRID_HEIGHT = GRID_SIZE;
        for (var x = 0; x < GRID_WIDTH; x++) {
            new GridObstacle(this._renderTex, this._gameGrid, cc.p(x, 0));
            new GridObstacle(this._renderTex, this._gameGrid, cc.p(x, GRID_HEIGHT-1));
        }
        for (var y = 1; y < GRID_HEIGHT-1; y++) {
            new GridObstacle(this._renderTex, this._gameGrid, cc.p(0, y));
            new GridObstacle(this._renderTex, this._gameGrid, cc.p(GRID_WIDTH-1, y));
        }

        // Setup objects
        this._pos = cc.p(GRID_SIZE/2, 0);
        this._snakeBody = [
            new SnakeBody(this._renderTex, this._gameGrid, cc.p(GRID_SIZE/2, -3)),
            new SnakeBody(this._renderTex, this._gameGrid, cc.p(GRID_SIZE/2, -2)),
            new SnakeBody(this._renderTex, this._gameGrid, cc.p(GRID_SIZE/2, -1)),
            new SnakeBody(this._renderTex, this._gameGrid, cc.p(GRID_SIZE/2, 0))
        ];
        //this.makeBody(cc.p(GRID_SIZE/2, 2));
        //this.makeBody(cc.p(GRID_SIZE/2, 1));
        //this.makeBody(cc.p(GRID_SIZE/2, 0)); // First segment is snake head
        //this.makeBody(cc.p(GRID_SIZE/2, -1));
        //this.makeBody(cc.p(GRID_SIZE/2, 0));
        this._headIdx = 3;

        // Scoreboard!
        //'01234567\n89ABCDEF\nGHIJKLMN\nOPQRSTUV\nWXYZ?!'
        var scoreboard = cc.LabelBMFont.create(this._gameRules._score.toString(), res.visitor_fnt);
        scoreboard.setPosition(cc.p(GRID_WIDTH-1, GRID_HEIGHT-2));
        scoreboard.setAnchorPoint(cc.p(1, 1));
        scoreboard.setColor(cc.color(64, 64, 255, 255));
        scoreboard.setVisible(false);

        this._renderTex.addChild(scoreboard, 1);
        this._scoreboard = scoreboard;

        var smallestDim = Math.min(size.width, size.height);
        this._renderTex.setScale(smallestDim / GRID_WIDTH, smallestDim / GRID_HEIGHT);

        // RenderTarget: Clear does not work in Canvas mode!
        this._renderTex.clearColorVal = cc.color(0, 0, 0, 255);
        this._renderTex.clearFlags = cc._renderContext.COLOR_BUFFER_BIT;

        this.addChild(this._renderTex);
        this._renderTex.setAutoDraw(true);

        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            this._renderTex.getSprite().getTexture().setAliasTexParameters();
        } else {
            DisableSmoothing();

            cc._addEventListener(window, 'resize', function () {
                DisableSmoothing();
            }, false);
        }

        this.scheduleUpdate();
    },
    makeBody:function(pos) {

        if (!pos)
            pos = this._pos;

        var body = new SnakeBody(this._renderTex, this._gameGrid, pos);

        // Insert after the current head index
        this.cycleHead();
        this._snakeBody.splice(this._headIdx, 0, body);
        return body;
    },
    cycleHead:function() {
        this._headIdx++;
        if (this._headIdx >= this._snakeBody.length)
            this._headIdx = 0;
    },
    getPos:function(pos) {
        return cc.p(pos.x * GRID_PITCH, pos.y * GRID_PITCH);
    },
    gameOver:function() {

        // Check high score
        var localStorage = window.localStorage;
        var label = null;
        var hiscore = localStorage.getItem('hiscore');
        if (!hiscore || this._gameRules._score > hiscore) {
            hiscore = this._gameRules._score;
            localStorage.setItem('hiscore', hiscore);

            label = cc.LabelBMFont.create('HI SCORE!', res.min_fnt);
            label.setPosition(cc.p(GRID_WIDTH/2, GRID_HEIGHT/2));
            label.setColor(cc.color(64, 64, 255, 255));
            this._renderTex.addChild(label);

            cc.log('Hi Score! ' + hiscore);
        }
        this.unscheduleUpdate();

        var myApp = this;
        var head = this._snakeBody[this._headIdx];
        head._node.setColor(cc.color(255, 40, 40, 255));

        // Flash some stuff
        this._scoreboard.setVisible(true);
        this.schedule(function() {
            if (label) {
                label.setVisible(!label.isVisible());
            }
            myApp._scoreboard.setVisible(!myApp._scoreboard.isVisible());

            if (myApp._scoreboard.isVisible())
                head._node.setColor(cc.color(255, 40, 40, 255));
            else
                head._node.setColor(head._color);
        }, .5);
        this.scheduleOnce(function() {
            cc.director.runScene(new MainMenuScene());
        }, 3);

    },
    update:function(dt) {

        ticks++;
        //cc.log('totalTime:' + totalTime + ' isVisible:' + this._scoreboard.isVisible() + ' hideScore:' + this._hideScoreTime);

        if (this._scoreboard.isVisible() && ticks >= this._hideScoreTime) {
            this._scoreboard.setVisible(false);
        }

        this._dir = this._nextDir;
        this._pos = cc.p(this._pos.x + this._dir.x, this._pos.y + this._dir.y);
        var segment = null;

        // Check for collisions
        var occupied = this._gameGrid.get(this._pos);
        if (occupied) {
            if (occupied instanceof SnakeBody) {
                cc.log('Game over, you ate yourself man! ' + occupied.getGridPos().x + ':' + this._pos.x);
                this.gameOver();
            } else if (occupied instanceof GridObstacle) {
                cc.log('Game over, man!');
                this.gameOver();
                return;
            } else if (occupied instanceof Apple) {
                occupied.destroy();
                segment = this.makeBody();

                this._gameRules.onEat();
                this._scoreboard.setString(this._gameRules._score.toString());
                this._scoreboard.setVisible(true);
                this._hideScoreTime = ticks + 6; // dt seems useless at our framerate. Use ticks.
            }
        }

        if (!segment) {
            // Move the snake tail into the new head position
            this.cycleHead();
            segment = this._snakeBody[this._headIdx];
            segment.moveTo(this._pos);
        }
    }
});

var SnakeGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new SnakeGameLayer();
        this.addChild(layer);
    }
});
