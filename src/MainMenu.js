
var MainMenuLayer = cc.Layer.extend({
    ctor:function () {

        this._super();
        var size = cc.director.getWinSize();

        // Bind keyboard input
        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            var local = this;
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (key == cc.KEY.space || key == cc.KEY.enter) {
                        cc.director.runScene(new SnakeGameScene());
                    }
                }
            }, this);
        }
        // Setup 32x32 render target
        var smallestDim = Math.min(size.width, size.height);
        var renderTex = cc.RenderTexture.create(32, 32);
        renderTex.x = size.width / 2;
        renderTex.y = size.height / 2;
        renderTex.setScale(smallestDim / GRID_WIDTH, smallestDim / GRID_HEIGHT);

        renderTex.setAutoDraw(true);
        this.addChild(renderTex);

        var tex = cc.textureCache.addImage(res.snake_title_png);

        //cc.log('cc._renderType:' + cc._renderType);
        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            tex.setAliasTexParameters();
        } else {
            var canvas = document.getElementById('gameCanvas');
            var context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;

            cc._addEventListener(window, 'resize', function () {
                var canvas = document.getElementById('gameCanvas');
                var context = canvas.getContext('2d');
                context.imageSmoothingEnabled = false;
            }, false);
        }

        var sb = cc.SpriteBatchNode.create(tex);
        sb.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        sb.setPosition(16, 16);
        renderTex.addChild(sb);

        var sprite = cc.Sprite.create(sb.texture);
        sb.addChild(sprite);

        var label = cc.LabelBMFont.create('PRESS\n ENTER', res.min_fnt);
        label.setPosition(cc.p(14, 9));
        label.setColor(cc.color(64, 64, 255, 255));
        //label.setScale(32, 32);
        renderTex.addChild(label);

        this.schedule(function() {
            label.setVisible(!label.isVisible());
        }, 1);

        /*
        var label = cc.LabelTTF.create("SNAAAAKE!", "Arial", 38);
        // position the label on the center of the screen
        label.x = size.width / 2;
        label.y = size.height / 2;
        // add the label as a child to this layer
        this.addChild(label, 5);*/
    }
});

var MainMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainMenuLayer();
        this.addChild(layer);
    }
});
