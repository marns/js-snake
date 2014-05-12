
cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(1024, 1024, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);

    //load resources
    cc.loader.load(g_resources, {}, function() {
        cc.director.runScene(new MainMenuScene());
    });
};
cc.game.run();

