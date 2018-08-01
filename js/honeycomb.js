var honeycomb;

class Hexagon {
    constructor( game, letter, sprite, x, y ) {
        if( x === undefined )
            x = 0.0;
        if( y === undefined )
            y = 0.0;
    
        this.sprite = game.add.sprite( x - sprite.width / 2, y - sprite.height / 2, sprite );
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

class HexGrid {
    constructor( x, y, R, dr ) {
        this.dx = Math.sqrt( 3 );
        this.dy = 1.5;

        this.x = x;
        this.y = y;
        this.R = R;
        this.dr = dr;
        this.r = this.calculateRadius();

        this.points = [];
        for( var i=0; i<this.R; i++) {
            var row = [];
            var J = this.R - Math.abs( i - ( this.R - 1 ) / 2 );
            var Y = this.r * ( i - ( this.R - 1 ) / 2 ) * this.dy + y;
            for( var j=0; j<J; j++ ) {
                var X = this.r * ( j - ( J -1 )/ 2  ) * this.dx + x;
                var g = game.add.graphics( X, Y );
                row.push( [ X, Y ] );
            }
            this.points.push( row );
        }
    }

    calculateRadius() {
        var width = 2 * Math.min( this.x, game.width - this.x );
        var height = 2 * Math.min( this.y, game.height - this.y );
        var wr = width / ( this.R * this.dx + this.dx );
        var hr = height / ( this.R * this.dy + this.dy );
        return Math.min( wr, hr );
    }
}

class Honeycomb {
    constructor( game, letters ) {
        this.dx = Math.sqrt( 3 );
        this.dy = 1.5;
        this.dr = 1;
        this.letters = letters;
        this.nrows = this.letters.length;
        this.grid = new HexGrid( game.width / 2, game.height / 2, this.nrows, this.dr );
        this.createSprite();
        this.highlights = [];

        this.children = [];
        for( var i=0; i<this.nrows; i++) {
            for( var j=0; j< this.ncols( i ); j++) {
                var letter = this.letters[ i ][ j ];
                var pos = this.grid.points[ i ][ j ];
                var hex = new Hexagon( game, letter, this.sprite, ...pos );
                this.children.push( hex );
            }
        }
    }

    child( I, J ) {
        var k = 0;
        for( var i=0; i<I; i++) {
            k += this.ncols( i );
        }
        return this.children[ k + J ];
    }

    resize() {
        this.createSprite();
        this.grid = new HexGrid( game.width / 2, game.height / 2, this.nrows, this.dr );
        var k = 0;
        for( var i=0; i<this.nrows; i++) {
            for( var j=0; j< this.ncols( i ); j++) {
                var pos = this.grid.points[ i ][ j ];
                this.children[ k ].sprite.loadTexture( this.sprite );
                this.children[ k ].sprite.position.x = pos[ 0 ] - this.sprite.width / 2;
                this.children[ k ].sprite.position.y = pos[ 1 ] - this.sprite.height / 2;
                for( var l=0; l<this.children[ k ].sprite.children.length; l++ ) {
                    var text = this.children[ k ].sprite.children[ l ];
                    if( text.setTextBounds !== undefined ) {
                        text.fontSize = ( 0.9 * this.sprite.width ) + "px";
                        text.setTextBounds( 0, 0, this.sprite.width, this.sprite.height );
                    }
                }
                k++;
            }
        }
    }

    createSprite() {
        var r = this.grid.r - this.dr;
        var points = [];
        for( var i = 0; i < 6; i++ ) {
            points.push( r * Math.cos( i * Math.PI / 3 + Math.PI/6 ) );
            points.push( r * Math.sin( i * Math.PI / 3 + Math.PI/6 ) );
        }
        var poly = new Phaser.Polygon( points );
        var graphics = game.add.graphics( 0, 0 );
        graphics.beginFill( 0xffffff );
        graphics.drawPolygon( poly );
        graphics.endFill();
        graphics.inputEnabled = true;

        this.sprite = graphics.generateTexture();
        this.sprite.centerX = 0;
        this.sprite.centerY = 0;
        graphics.destroy();
        return this.sprite;
    }

    ncols( row ) {
        return this.letters[ row ].length;
    }

    neighbours( i, j ) {
        var L = ( this.nrows - 1 ) / 2;
        var output = [];
        if( i > 0 ) {
            if( i <= L && j > 0 )
                output.push( [ i - 1, j - 1 ] );
            if( j < this.ncols( i - 1 ) )
                output.push( [ i - 1, j ] );
            if( i > L && this.ncols( i - 1 ) > j + 1 )
                output.push( [ i - 1, j + 1 ] );
        }

        if( j > 0 )
            output.push( [ i , j - 1 ] )
        if( this.ncols( i ) > j + 1 )
            output.push( [ i , j + 1 ] )

        if( this.nrows > i + 1 ) {
            if( i >= L && j > 0 )
                output.push( [ i + 1, j - 1 ] );
            if( j < this.ncols( i + 1 ) )
                output.push( [ i + 1, j ] );
            if( i < L && this.ncols( i + 1 ) > j + 1 )
                output.push( [ i + 1, j + 1 ] );
        }
        return output;
    }

    letter( i, j ) {
        if( i > this.letters.length ) {
            console.log( "aah", i );
        } else if( j > this.letters[ i ].length ) {
            console.log( "aah2", i, j );
        } else {
            return this.letters[ i ][ j ];
        }
    }

    letterCoordinates( letter ) {
        var output = [];
        for( var i=0; i<this.nrows; i++) {
            for( var j=0; j< this.ncols( i ); j++) {
                if( this.letter( i, j ) == letter )
                    output.push([ i, j ]);
            }
        }
        return output;
    }

    findWord( word ) {
        for( var i=0; i < this.highlights.length; i++ ) {
            this.highlights[ i ].destroy();
        }
        this.highlights = [];

        var paths = this.letterCoordinates( word[ 0 ] ).map( x => [ x ] );
        var spaths = paths.map( x => ','.concat( ...x ) );
        var neighbours = paths.map( x=> this.neighbours( ...x[0] ) )

        var i = 1;
        while( i < word.length ) {
            var letter = word[ i ];
            var new_neighbours = [];
            var new_paths = [];
            for( var j=0; j< neighbours.length; j++ ) {
                var neighbour = neighbours[ j ];
                for( var k=0; k<neighbour.length; k++ ) {
                    var loc = neighbour[ k ];
                    var sneighbour = ','.concat( ...loc );
                    if( this.letter(...loc) == letter && spaths[ j ].indexOf( sneighbour ) < 0 ) {
                        new_paths.push( paths[ j ].concat( [ loc ] ) );
                        new_neighbours.push( this.neighbours( ...loc ) );
                    }
                }
            }
            i += 1;
            neighbours = new_neighbours;
            paths = new_paths;
        }
        for( var i=0; i<paths.length; i++) {
            var path = paths[ i ];
            var colour = randomColour()
            for( var j=0; j<path.length; j++) {
                var coord = path[ j ];
                var child = this.child( ...coord ).sprite;
                var pos = child.position;
                var highlight = new Phaser.Sprite( game, 0, 0, this.sprite );
                highlight.blendMode = PIXI.blendModes.OVERLAY;
                child.addChildAt( highlight, 0 );
                var scale = 0.8;
                highlight.scale.x *= scale;
                highlight.scale.y *= scale;
                highlight.centerX = ( highlight.width / ( 2 * scale ) );
                highlight.centerY = ( highlight.height / ( 2 * scale ) );
                highlight.tint &= colour;
                highlight.alpha = 0.5;
                this.highlights.push( highlight );
            }
            console.log( ''.concat( ...path.map( x => this.letter( ...x ) ) ) );
        }
        return paths;
    }
}
