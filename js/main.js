class Hexagon {
    constructor( game, letter, sprite, x, y ) {
        if( x === undefined )
            x = 0.0;
        if( y === undefined )
            y = 0.0;
    
        this.sprite = game.add.sprite( x, y, sprite );
        this.sprite.inputEnabled = true;
        
        this.text = new Phaser.Text( game, 0, 0, letter, {
            boundsAlignH: "center",
            boundsAlignV: "middle",
            stroke: "#00ff00",
        });
        this.letter = letter;

        this.sprite.addChild( this.text );
        this.text.setTextBounds( 0, 0, this.sprite.width, this.sprite.height );
        this.color = 0xffffff;
        this.used = false;
    }
}

var dy = 2 * Math.cos( Math.PI / 6 );
var dx = 2;
var r = 20;
var dr = 0;

var objects = [];

function create() {
    var points = [];
    for( var i = 0; i < 6; i++ ) {
        points.push( r * Math.cos( i * Math.PI / 3 + Math.PI/6 ) );
        points.push( r * Math.sin( i * Math.PI / 3 + Math.PI/6 ) );
    }
    poly = new Phaser.Polygon( points );
    graphics = game.add.graphics( 0, 0);
    graphics.beginFill( 0xffffff );
    graphics.drawPolygon( poly );
    graphics.endFill();
    graphics.inputEnabled = true;

    var hexSprite = graphics.generateTexture();
    graphics.destroy();

    game.time.advancedTiming = true;
    var keys = Object.keys( layout );
    var keylen = keys.length;
    var R = ( keylen - 1 ) / 2;
    for( var h=-R; h<=R; h++) {
        var jR = ( layout[ keys[ h + R ] ].length - 1 ) / 2;
        var y = (r + dr ) * h * dy + game.height / 2;
        for( var j=-jR; j<=jR; j++) {
            var x = (r + dr ) * j * dx + game.width / 2;
            var letter = layout[ keys[ R + h ] ][ j + jR ];
            var hex = new Hexagon( game, letter, hexSprite, x, y );
            objects.push( hex );
        }
    }

    game.input.onDown.add( onDown );
    game.input.onUp.add( onUp );
}

function update() {
    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   
    if( game.input.activePointer.isDown ) {
        for( var i=0; i<objects.length; i++) {
            var object = objects[ i ];
            var input = object.sprite.input;
            if( input.pointerOver() ) {
                if( !object.used ) {
                    object.sprite.tint = downColor;
                    word += object.letter;
                    object.used = true;
                }
                break;
            }
        }
    }
}

var downColor;
var word = "";
function onDown() {
    for( var i=0; i<objects.length; i++) {
        var object = objects[ i ];
        var input = object.sprite.input;
        if( input.pointerOver() ) {
            if(input.sprite.tint == 0xffffff ) {
                var r = game.rnd.between( 0x33, 0xdd );
                var g = game.rnd.between( 0x33, 0xdd );
                var b = game.rnd.between( 0x33, 0xdd );
                downColor = (r << 16 ) + ( g << 8 ) + b;
            } else {
                downColor = 0xffffff;
            }

            object.sprite.tint = downColor;
            break;
        }
    }
}

function onUp() {
    if(downColor != 0xffffff ) {
        console.log( word );
    }
    word="";
    downColor = 0xffffff;
    for( var i=0; i<objects.length; i++) {
        var object = objects[ i ];
        object.used = false;
    }

}
