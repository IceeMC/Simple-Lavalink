const { get } = require("snekfetch");
const AudioNode = require("./AudioNode.js");
const AudioPlayer = require("./AudioPlayer");

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
     * Creates a new player or returns an old player.
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