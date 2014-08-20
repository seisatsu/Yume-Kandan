/*
* Yume Kandan (Dream Chat)
* Produced for Uboachan.net
* Copyright (c) 2014 Michael D. Reiley (Seisatsu)
*/

// **********
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the 'Software'), to 
// deal in the Software without restriction, including without limitation the 
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
// sell copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
// IN THE SOFTWARE.
// **********


/*** Tiled Map Handler Class ***/

/*
* This class reads a JSON map produced by the Tiled map editor, and loads the
* graphics for each layer into a jaws.TileMap.
*
* ==========
* Attributes
* ==========
* 
* mapdata (arg): JSON contents of the Tiled map.
* basedir (arg): Directory where tilesheets are kept.
* tilesheet: Path to the tilesheet image.
* width: Width of the map in tiles.
* height: Height of the map in tiles.
* tilewidth: Width of tiles in the sheet.
* tileheight: Height of tiles in the sheet.
* tileset: jaws.SpriteSheet containing graphics for each tile in the sheet.
* below_layers: Layers below the player/object layer, lowest to highest. (jaws.TileMap)
* object_layer: List of objects in the player/object layer.
* above_layers: Layers above the player/object layer, lowest to highest. (jaws.TileMap)
*
* =======
* Methods
* =======
*
* load: Load the tilemap and populate layer data.
*/
function TiledMap(mapdata, basedir) {
    this.mapdata = mapdata;
    this.basedir = basedir;

    this.tilesheet = basedir + mapdata['tilesets'][0]['image'];

    this.width = mapdata['width'];
    this.height = mapdata['height'];

    this.tilewidth = mapdata['tilesets'][0]['tilewidth'];
    this.tileheight = mapdata['tilesets'][0]['tileheight'];

    // Tileset made from each tile in the tilesheet.
    this.tileset = new jaws.SpriteSheet({
        image: this.tilesheet,
        orientation: 'right',
        frame_size: [
            this.tilewidth,
            this.tileheight
        ]
    });

    this.below_layers = [];
    this.object_layer = mapdata['layers'][config['graphics']['layers_below']]['objects'];
    this.above_layers = [];

    // Load the map into graphical layers.
    this.load = function() {
        var layer = 0;

        // Assemble each layer as a jaws.TileMap.
        while (layer < this.mapdata['layers'].length) {
	        // Is this the object layer? If so, skip it.
	        if (this.mapdata['layers'][layer]['type'] == 'objectgroup') {
	            layer++;
	        }

	        var tiles = new jaws.SpriteList();

	        // Push tiles into sprite list.
	        var i = 0;
	        for(var h = 0; h < this.mapdata['height']; h++) {
	            for(var w = 0; w < this.mapdata['width']; w++) {
	                // Grab tile from tileset, position it, and push it onto the list. Skip zeroes.
	                if (this.mapdata['layers'][layer]['data'][i] == 0) {
	                	i++;
	                	continue;
	                }
	                var tile = this.tileset.frames[this.mapdata['layers'][layer]['data'][i]-1];
	                var tilesprite = new jaws.Sprite({image: tile, x: w*this.tilewidth, y: h*this.tileheight});
	                tiles.push(tilesprite);
	                i++;
	            }
	        }

	        // Create a jaws.TileMap from the collected sprite list.
	        var tile_map = new jaws.TileMap({
	            size: [
	                this.mapdata['width'],
	                this.mapdata['height']
	            ],
	            cell_size: [
	                this.tilewidth,
	                this.tileheight
	            ]
	        });
	        tile_map.push(tiles);

	        // Store layers below player/object layer.
	        if (layer < config['graphics']['layers_below']) {
	            this.below_layers.push(tile_map);
	        }

	        //Store layers above player/object layer.
	        else  {
	            this.above_layers.push(tile_map);
	        }

	        layer++;
    	}
    }
}
