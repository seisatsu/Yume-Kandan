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
* This class loads a JSON map produced by the Tiled map editor, and loads the
* graphics for each layer into a jaws.TileMap.
*
* ==========
* Attributes
* ==========
* 
* mapdata (arg): JSON contents of the Tiled map.
* basedir (arg): Directory where tilesheets are kept.
* tilesheet: Path to the tilesheet image.
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

	this.tilesheet = basedir + this.tileset['image'];

	this.tilewidth = mapdata['tilesets'][0]['tilewidth'];

	this.tileheight = mapdata['tilesets'][0]['tileheight'];

	// Tileset made from each tile in the tilesheet.
	jaws.assets.add(this.tilesheet);
	this.tileset = new jaws.SpriteSheet({
		image: this.tilesheet,
		frame_size: [
			this.tilewidth,
			this.tileheight
		]
	});

	this.below_layers = [];

	this.object_layer = mapdata['layers'][config['graphics'][layers_below]]['objects'];

	this.above_layers = [];

	// Load the map into graphical layers.
	function load() {
		// Assemble each layer as a jaws.TileMap.
		var l = 0;
		for (var layer in mapdata['layers']) {
			// Is this the object layer? If so, skip it.
			if (l == config['graphics'][layers_below]) {
				continue;
			}

			var tiles = new jaws.SpriteList();

			// Push tiles into sprite list.
			var i = 0;
			for(var h = 0; h < this.mapdata['height']; h++) {
        		for(var w = 0; w < this.mapdata['width']; w++) {
        			// Grab tile from tileset and push it onto the list.
            		tiles.push(this.tileset.frames[layer['data'][i]-1].moveTo(w*this.tilewidth, h*this.tileheight));
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
        	if (l < config['graphics'][layers_below]) {
        		this.below_layers += tile_map;
        	}

        	//Store layers above player/object layer.
        	else  {
        		this.above_layers += tile_map;
        	}
		}
	}
}
