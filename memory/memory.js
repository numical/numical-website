// constants
var RESOURCES = {
    MENAGERIE : [
        {id:"BabyTeddy", src:"./menagerie/baby_teddy.png" },
        {id:"Bunny", src:"./menagerie/bunny.png" },
        {id:"Dolly", src:"./menagerie/dolly.png" },
        {id:"George", src:"./menagerie/george.png" },
        {id:"Kanga", src:"./menagerie/kanga.png" },
        {id:"Piggy", src:"./menagerie/piggy.png" },
        {id:"Pingu", src:"./menagerie/pingu.png" },
        {id:"Sally", src:"./menagerie/sally.png" },
        {id:"Sophie", src:"./menagerie/sophie.png" },
        {id:"Tammy", src:"./menagerie/tammy.png" },
        {id:"Wolfy", src:"./menagerie/wolfy.png" }
    ],
    ICONS : [
        {id:"QuestionMark", src:"./menagerie/cartoon_question_mark_small.png" }
    ],
    SOUNDS : [
        {id:"RevealTile", src:"./sounds/109663__grunz__success-low.wav" },
        {id:"GameOver", src:"./sounds/109662__grunz__success.wav" }
    ]
};

var CONSTANTS = {
    NUMBER_OF_COLUMNS:4,
    NUMBER_OF_ROWS:3,
    BMP_PADDING:25,
    BMP_WIDTH:200,
    BMP_HEIGHT:200,
    TEXT_COLOR:"#F9CD1B",
    HIGHLIGHTED_TEXT_COLOR:"#FF0000",
    ALPHA_TRANSITION_PERIOD:1000,
    HIDE_TILE_DELAY:2000,
    PLAY_SOUNDS:true
}


// main process
function init() {
    var gameBoard = new GameBoard();
    gameBoard.showWelcome();
    gameBoard.loadResourcesAndStart();
}

// types
function GameBoard() {

    this.isSoundOn = CONSTANTS.PLAY_SOUNDS;

    var _this = this;
    var stage = new createjs.Stage("game");
    var loadQueue = new createjs.LoadQueue(false);
    var game = null;

    createjs.Ticker.addEventListener( "tick", stage );

    this.showWelcome = function() {
        var text = new createjs.Text("Get ready to play...", "36px 'Permanent Marker'", CONSTANTS.TEXT_COLOR);
        text.x = stage.canvas.width / 2 - text.getBounds().width / 2;
        text.y = stage.canvas.height / 2;
        stage.addChild(text);
        stage.update();
    }

    this.loadResourcesAndStart = function() {
        loadQueue.installPlugin( createjs.Sound );
        loadQueue.loadManifest( RESOURCES.MENAGERIE );
        loadQueue.loadManifest( RESOURCES.ICONS );
        loadQueue.loadManifest( RESOURCES.SOUNDS );
        loadQueue.addEventListener("complete", startGame );
    }

    this.getResource = function( resourceKey ) {
        return loadQueue.getResult( resourceKey );
    }

    this.addToGUI = function( element ){
        stage.addChild( element );
    }

    this.currentGame = function() {
        return game;
    }

    this.endGame = function() {
        if ( _this.isSoundOn ) {
            createjs.Sound.play("GameOver");
        }

        var congrats = addEndGameText( "Well done! Play again?" );
        congrats.x = stage.canvas.width / 2 - congrats.getBounds().width / 2;
        congrats.y = stage.canvas.height / 2;
        createjs.Tween.get( congrats ).to( {x:100},  CONSTANTS.ALPHA_TRANSITION_PERIOD );

        var yes = addEndGameText( "Yes", function(){
            stage.enableMouseOver( 0 );
            startGame();
        } );
        yes.x = stage.canvas.width / 2 - yes.getBounds().width / 2;
        yes.y = stage.canvas.height / 2 + congrats.getBounds().height * 4;

        var no = addEndGameText( "No", function(){
            window.location = "http://www.numical.com";
        } );
        no.x = yes.x + 200;
        no.y = yes.y;

        stage.enableMouseOver( 50 );
    }

    function addEndGameText( displayText, clickFunction ) {
        var text = new createjs.Text(
            displayText,  "12px 'Permanent Marker'", CONSTANTS.TEXT_COLOR);
        text.alpha = 0;
        stage.addChild( text );

        createjs.Tween.get( text ).to( {alpha:1},  CONSTANTS.ALPHA_TRANSITION_PERIOD );
        createjs.Tween.get( text ).to( {scaleX:5},  CONSTANTS.ALPHA_TRANSITION_PERIOD );
        createjs.Tween.get( text ).to( {scaleY:5},  CONSTANTS.ALPHA_TRANSITION_PERIOD );

        if ( clickFunction != null ) {
            text.on("mouseover", function() {
                text.color = CONSTANTS.HIGHLIGHTED_TEXT_COLOR;
            } );
            text.on("mouseout", function() {
                text.color = CONSTANTS.TEXT_COLOR;
            } );
            text.on( "click", clickFunction );
        }

        return text;
    }

    function startGame() {
        stage.removeAllChildren();
        stage.update();
        game = new Game( _this )
        game.start();
    }
}


function Game( gameBoard ) {

    var tiles = [];
    var revealedTiles = [];
    var numberTilesOutOfPlay = 0;

    this.start = function() {
        createTiles();
    };

    this.tilePlayed = function( tile ){

        switch( revealedTiles.length ) {
            case 0:
                revealedTiles.push(tile);
                tile.reveal( true );
                break;
            case 1:
                if (tile.matches(revealedTiles[0])) {
                    setOutOfPlay( tile );
                    setOutOfPlay( revealedTiles[0] );
                    revealedTiles.pop();
                    tile.reveal( false );
                    if ( tiles.length === numberTilesOutOfPlay ) {
                        gameBoard.endGame();
                    }
                } else {
                    revealedTiles.push(tile);
                    tile.reveal( true );
                }
                break;
            default:
                // do nothing
        }
    }

    this.tileHidden = function( tile ) {
        var index = revealedTiles.indexOf(tile);
        if (index > -1) {
            revealedTiles.splice(index, 1);
        }
    }

    function createTiles(){

        var availableMenagerieIndices = [];
        for (var i = 0; i < RESOURCES.MENAGERIE.length; i++) {
            availableMenagerieIndices[i] = i;
        }

        var tileMenagerieIndices = [];
        for (var i = 0; i < (CONSTANTS.NUMBER_OF_COLUMNS * CONSTANTS.NUMBER_OF_ROWS) / 2; i++) {
            var randomIndex = Math.floor( Math.random() * availableMenagerieIndices.length )  ;
            tileMenagerieIndices.push( availableMenagerieIndices[ randomIndex ] );
            availableMenagerieIndices.splice( randomIndex, 1);
        }

        // duplicate and randomize tile menagerie indices
        tileMenagerieIndices = tileMenagerieIndices.concat( tileMenagerieIndices );
        tileMenagerieIndices.sort(function () {
            return 0.5 - Math.random();
        });

        // create tiles, assigning graphics and positions
        var xIncrement = CONSTANTS.BMP_WIDTH + CONSTANTS.BMP_PADDING;
        var yIncrement = CONSTANTS.BMP_HEIGHT + CONSTANTS.BMP_PADDING;
        var counter = 0;
        for (var x = CONSTANTS.BMP_PADDING; x <= CONSTANTS.NUMBER_OF_COLUMNS * xIncrement; x += xIncrement) {
            for (var y = CONSTANTS.BMP_PADDING; y < CONSTANTS.NUMBER_OF_ROWS * yIncrement; y += yIncrement) {
                tiles[counter] = new Tile( gameBoard, tileMenagerieIndices[counter], x, y )
                counter++;
            }
        }
    }

    function setOutOfPlay( tile ) {
        numberTilesOutOfPlay++;
        // setting out of play prevents delayed hide occuring
        tile.setOutOfPlay();
    }
}

function Tile( gameBoard, menagerieIndex, xCoord, yCoord ) {

    var _this = this;
    var beastName = RESOURCES.MENAGERIE[menagerieIndex].id;
    var isHidden = true;
    var inPlay = true;

    var hiddenSymbol = new createjs.Bitmap( gameBoard.getResource( RESOURCES.ICONS[0].id) );
    hiddenSymbol.x = xCoord;
    hiddenSymbol.y = yCoord;
    hiddenSymbol.alpha = 1
    hiddenSymbol.on( "click", function(){
        // guard against double clicks
        if ( !isHidden ) return;
        gameBoard.currentGame().tilePlayed( _this );
    } );
    gameBoard.addToGUI( hiddenSymbol );

    var beastFace = new createjs.Bitmap( gameBoard.getResource( beastName ) );
    beastFace.x = xCoord;
    beastFace.y = yCoord;
    beastFace.alpha = 0;
    gameBoard.addToGUI( beastFace );

    this.getBeastName = function() {
        return beastName;
    }

    this.setOutOfPlay = function() {
        inPlay = false;
    }

    this.reveal = function( hideAfterDelay ) {
        isHidden = false;
        if ( gameBoard.isSoundOn ) {
            createjs.Sound.play("RevealTile");
        }
        if ( hideAfterDelay ) {
            draw( delayedHide );
        }
        draw();
    }

    this.hide = function() {
        isHidden = true;
        draw();
    }

    this.matches = function( tile ) {
        if ( tile instanceof Tile ) {
            return ( beastName === tile.getBeastName()  );
        }
        return false;
    }

    function draw( postFunction ) {
        var delay = CONSTANTS.ALPHA_TRANSITION_PERIOD;
        var toHide;
        var toShow;
        if ( isHidden ) {
            toHide = beastFace;
            toShow = hiddenSymbol;
        } else {
            toHide = hiddenSymbol;
            toShow = beastFace;
        }
        createjs.Tween.get( toHide ).to( {alpha:0}, delay );
        if ( postFunction == null ) {
            createjs.Tween.get( toShow ).to( {alpha:1}, delay );
        } else {
            createjs.Tween.get( toShow ).to( {alpha:1}, delay).call( postFunction );
        }
    }

    function delayedHide() {
        var delayUntil = createjs.Ticker.getTime() + CONSTANTS.HIDE_TILE_DELAY;
        var delayListener = function delayListener() {
            if ( createjs.Ticker.getTime() > delayUntil ) {
                createjs.Ticker.removeEventListener( "tick", delayListener );
                if ( inPlay ) {
                    gameBoard.currentGame().tileHidden( _this );
                    _this.hide();
                }
            }
        }
        createjs.Ticker.addEventListener( "tick", delayListener );
    }
}





