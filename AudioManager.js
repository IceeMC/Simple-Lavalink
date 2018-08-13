const { get } = require("snekfetch");
const AudioNode = require("./AudioNode.js");
const AudioPlayer = require("./AudioPlayer.js");
const AudioTrack = require("./AudioTrack.js");

/**
 * 
 */
class AudioManager extends Map {

    constructor(client, nodes, shards = 0) {
        super();

        /**
         * The Discord.JS client used.
         * @readonly
         * @type {Client}
         */
        Object.defineProperty(this, "client", { value: client, writable: false });

        /**
         * A map containing audio nodes,
         * 
         */
        this.nodes = new Map();
        
        Object.defineProperty(this, "_nodes", { value: nodes, writable: false });

        // Start launching all audio nodes
        this._launch();

        this.client.on("raw", raw => {
            if (raw.t === "VOICE_SERVER_UPDATE") {
                const player = this.get(raw.d.guild_id);
                // Check if there is a AudioPlayer
                if (!player) return;
                player._update(raw);
            }
        });
    }

    /**
     * Launches lavalink nodes.
     */
    _launch() {
        for (const n of this._nodes) {
            const node = new AudioNode(this, n);
            node.create(n);
            this.nodes.set(n.host, node);
        }
    }
    
    /**
     * Makes the bot open a voice connection in a guild voice channel.
     * @param {string} data - An object containing values for the bot to join a voice channel.
     * @param {string} data.guild - The guild that owns voice channel.
     * @param {string} data.channel - The voice channel in the guild.
     * @param {boolean} [data.mute] - Determines if the bot will be deafened when the bot joins the channel.
     * @param {boolean} [data.deaf] - Determines if the bot will be muted when the bot joins the channel.
     * @param {boolean} data.host - The host of the AudioNode.
     * @returns {AudioPlayer} The new AudioPlayer
     */
    join(data) {
        this.client.ws.send({
            op: 4,
            shard: this.client.shard ? this.client.shard.id : 0,
            d: {
                guild_id: data.guild,
                channel_id: data.channel,
                self_deaf: data.mute || false,
                self_mute: data.deaf || false
            }
        });
        const node = this.nodes.get(data.host);
        if (!node) throw new Error(`No node with host: ${data.host} found.`);
        return this._returnPlayer(data, node);
    }

    _convert(trackArray) {
        const tempTracks = [];
        for (const track in trackArray) tempTracks.push(new AudioTrack(track));
        return tempTracks;
    }

    /**
     * @typedef {TrackResult}
     * @param {string} search The search to execute on the node
     * @param {string} host The audio node's host.
     * @returns {Promise<TrackResult>}
     */
    getTracks(search, host) {
        const node = this.nodes.get(host);
        if (!node) return Promise.reject(new Error(`No node with host: ${host} found.`));
        return get(`http://${node.host}:2333/loadtracks?identifier=${search}`)
            .set("Authorization", node.password)
            .then(res => {
                // Lavalink versions under 3.0
                if (Array.isArray(res.body)) {
                    if (res.body.length) return { tracks: this._convert(res.body) }
                    return null;
                }
                // Lavalink version 3.0
                if (res.body.loadType === "NO_MATCHES" || res.body.loadType === "LOAD_ERROR") return null;
                if (res.body.loadType === "SEARCH_RESULT" || res.body.loadType === "TRACK_LOADED") return {
                    tracks: this._convert(res.body.tracks)
                };
                if (res.body.loadType === "PLAYLIST_LOADED") return {
                    name: res.body.playlistInfo.name,
                    tracks: this._convert(res.body.tracks)
                };
            })
            .catch(error => { return null; });
    }

    /**
     * Adds a audio node
     * @returns {AudioNode}
     */
    addNode(node) {
        const n = new AudioNode(node);
        n.create(node);
        this.nodes.set(node.host, n);
        return n;
    }

    /**
     * Removes an audio node.
     * @returns {boolean}
     */
    removeNode(host) {
        const node = this.nodes.get(host);
        if (!node) return false;
        return this.nodes.delete(node);
    }

    /**
     * Makes the bot leave a voice channel and deletes the player.
     * @param {string} id The guild id.
     * @returns {boolean}
     */
    leave(id) {
        this.client.ws.send({
            op: 4,
            d: {
                guild_id: id,
                channel_id: null,
                self_deaf: false,
                self_mute: false
            }
        });
        const player = this.get(id);
        if (!player) return;
        return this.delete(id);
    }

    /**
     * Returns a new player or an old player.
     * @param {Object} data - The object containing player data.
     * @param {AudioNode} node - The AudioNode to use.
     * @returns {AudioPlayer}
     * @private
     */
    _returnPlayer(data, node) {
        const player = this.get(data.guild);
        if (player) return player;
        this.set(data.guild, new AudioPlayer(data, node, this));
        return this.get(data.guild);
    }

}

module.exports = AudioManager;
