# Simple LavaLink

## The simpler way to uh, well, do LavaLink stuff

# Authors:
- Ice
- BloodyPikachu

# Installation
Stable: `npm install simple-lavalink`

Master: `npm install IceeMC/simple-lavalink`

# Wanna know some more information?
- Join our discord!
- https://discord.gg/swYpajt

# Reasons to join
- Cake
- Ice Cream
- LavaLink Support
- Bot Support
- Meet new people / Find new developers to talk to.
- ~~Go on a walk~~ (You can't. Your looking at our github page .-.)

# Using the module
- It's really cool btw.
```js
const { AudioManager } = require("simple-lavalink");
const nodes = [ { host: "localhost", port: 80, region: "us-west", restPort: 2333 } ]
const manager = new AudioManager(client, nodes, 1);
```

# Getting Tracks from the REST API
The AudioManager provides a method called `getTracks`

which of course gets audio tracks from the rest api
It takes to arguments

the first is the search and the second is the node host

# Example
- Probably should use this as well.
```js
manager.getTracks("ytsearch:never gonna give you up")
    .then(result => {
        const { tracks } = result;
        if (!tracks) throw "Could not fetch tracks";
        console.log(tracks[0]);
        // Output: AudioTrack { ... }
    });
```