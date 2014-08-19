/*
* Yume Kandan (Dream Chat)
* Produced for Uboachan.net
* Copyright (c) 2014 Michael D. Reiley (Seisatsu)
*/

// **********
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to 
// deal in the Software without restriction, including without limitation the 
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
// sell copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
// IN THE SOFTWARE.
// **********


/*** TODO ***/

// * The server should understand the same map files as the client, and check for illegal moves.
// * Add support for multiple areas and movement between areas.
// * Add support for multiple graphical and walkable layers.


/*** Initial Setup ***/

// Includes.
var io = require("socket.io")(); 

// Load config file.
var configfile = __dirname + '/config.json';
var config = require(configfile);

// Setup global variables.
var players = {}; // cid -> [name, posx, posy]


/*** Helper Functions ***/

// Find player by name.
function playerByName(name) {
    for (cid in players) {
        if (cid["name"] == name) {
            return cid;
        }
    }
}


/*** Player Event Handling ***/

io.on("connection", function (client) {
    // *** Player joined the chat.
    client.on("join", function(name){
        console.log("Join: " + name);

        // Insert player by cid.
        players[client.id] = {
            "name": name,
            "posx": 0,
            "posy": 0
        };

        // Send welcome message.
        client.emit("server-message", "Welcome to the chat.");

        // Send global join notification.
        io.sockets.emit("server-message", name + " entered the chat.");

        // Tell everyone who's online.
        io.sockets.emit("update-players", client.id, players);
    });

    // *** Player left the chat.
    client.on("disconnect", function(){
        if (client.id in players) {
            console.log("Disconnect: " + players[client.id]["name"]);

            // Send global disconnect notification.
            io.sockets.emit("server-message", players[client.id]["name"] + " woke up.");

            // Remove the player from the players list.
            delete players[client.id];

            // Tell everyone who's online.
            io.sockets.emit("update-players", players);
        }
    });

    // *** Player said something.
    client.on("say", function(message){
        // Relay the player's message.
        io.sockets.emit("say", players[client.id], message);
    });

    // *** Player moved. "x" and "y" are integer values of the change in x and/or y coordinates.
    client.on("move", function(x, y){
        // Register changes to the player's position in the players table.
        players[client.id]["posx"] += x;
        players[client.id]["posy"] += y;

        // Report the movement to other players.
        io.sockets.emit("move", players[client.id], x, y);
    });
});


/*** Begin Listening ***/

io.listen(config["network"]["port"]);
