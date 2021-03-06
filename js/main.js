function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function preload() {
    var dataName = getParameterByName( "data" ) || '123';
    game.load.json( 'data', 'data/' + dataName + '.json' );
}
function create() {
    game.time.advancedTiming = true;
    honeycomb = new Honeycomb( game, game.cache.getJSON( 'data' )[ 'letters' ] );

    game.input.onDown.add( onDown );
    game.input.onUp.add( onUp );
    //honeycomb.findWord( "and" )
}

function update() {
    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   
    if( game.input.activePointer.isDown ) {
        for( var i=0; i<honeycomb.children.length; i++) {
            var object = honeycomb.children[ i ];
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

function randomColour() {
    var r = game.rnd.between( 0x33, 0xdd );
    var g = game.rnd.between( 0x33, 0xdd );
    var b = game.rnd.between( 0x33, 0xdd );
    return (r << 16 ) + ( g << 8 ) + b;
}

var downColor;
var word = "";
function onDown() {
    for( var i=0; i<honeycomb.children.length; i++) {
        var object = honeycomb.children[ i ];
        var input = object.sprite.input;
        if( input.pointerOver() ) {
            if(input.sprite.tint == 0xffffff ) {
                downColor = randomColour();
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
    for( var i=0; i<honeycomb.children.length; i++) {
        var object = honeycomb.children[ i ];
        object.used = false;
    }
}

function resize() {
    honeycomb.resize();
}
