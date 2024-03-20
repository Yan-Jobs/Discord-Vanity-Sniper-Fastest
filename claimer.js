"use strict";
const fetch = require("node-fetch");
const WebSocket = require("ws");
const settings = require("./settings");
const guilds = require("./guilds");

class claimer {
    constructor() {
        this.opcodes = {
            DISPATCH: 0,
            HEARTBEAT: 1,
            IDENTIFY: 2,
            RECONNECT: 7,
            HELLO: 10,
            HEARTBEAT_ACK: 11,
        };
        this.createPayload = (data) => JSON.stringify(data);

        this.startWebSocket();
    }

    startWebSocket() {
        const socket = new WebSocket("wss://gateway.discord.gg/?v=7&encoding=json");

        socket.on("open", () => {
            console.log("cakal url sniper aktif");
            this.heartbeatInterval = setInterval(() => this.heartbeat(socket), 5000); // Adjust the heartbeat interval if needed

            socket.on("message", this.handleMessage.bind(this, socket));
            socket.on("close", this.handleClose.bind(this, socket));
            socket.on("error", this.handleError.bind(this, socket));
        });
    }

    handleMessage(socket, message) {
        const data = JSON.parse(message);
        if (data.op === this.opcodes.DISPATCH) {
            switch (data.t) {
                case "GUILD_UPDATE":
                    this.handleGuildUpdate(data.d);
                    break;
                case "READY":
                    this.handleReady(data.d);
                    break;
                case "GUILD_CREATE":
                    this.handleGuildCreate(data.d);
                    break;
                case "GUILD_DELETE":
                    this.handleGuildDelete(data.d);
                    break;
            }
        } else if (data.op === this.opcodes.RECONNECT) {
            process.exit();
        } else if (data.op === this.opcodes.HELLO) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = setInterval(() => this.heartbeat(socket), data.d.heartbeat_interval);
            this.identify(socket);
        }
    }

    handleClose(socket, reason) {
        console.log('websockrt gg:', reason);
        process.exit();
    }

    handleError(socket, error) {
        console.error('WebSocket error:', error);
        process.exit();
    }

    heartbeat(socket) {
        socket.send(this.createPayload({
            op: this.opcodes.HEARTBEAT,
            d: Date.now(),
        }));
    }

    identify(socket) {
        socket.send(this.createPayload({
            op: this.opcodes.IDENTIFY,
            d: {
                token: settings.SNIPER_SELF_TOKEN,
                intents: 1,
                properties: {
                    os: "Linux",
                    browser: "Firefox",
                    device: "desktop",
                },
            },
        }));
    }

    handleGuildUpdate(guildData) {
        const find = guilds[guildData.guild_id];
        console.log(guildData);
        if (typeof find?.vanity_url_code === 'string' && find.vanity_url_code !== guildData.vanity_url_code) {
            fetch(`https://discord.com/api/v7/guilds/${settings.SNIPER_GUILD_ID}/vanity-url`, {
                method: "PATCH",
                body: this.createPayload({
                    code: find.vanity_url_code,
                }),
                headers: {
                    Authorization: settings.URL_SNIPER_SELF_TOKEN,
                    "Content-Type": "application/json",
                },
            })
            .then(async (res) => {
                if (res.ok) {
                    await settings.WEBHOOKS.SUCCESS(`discord.gg/${find.vanity_url_code} **|** Bizden hizlisi mezarda. @everyone **|** 0.1ms`);
                } else {
                    const error = await res.json();
                    await settings.WEBHOOKS.FAIL(`Error while sniping URL: **\`${find.vanity_url_code}\`**.
\`\`\`JSON
${JSON.stringify(error, null, 4)}
\`\`\`
`);
                }
                delete guilds[guildData.guild_id];
            })
            .catch(err => {
                console.log(err);
                delete guilds[guildData.guild_id];
            });
        }
    }

    handleReady(data) {
        data.guilds
            .filter((guild) => typeof guild.vanity_url_code === "string")
            .forEach((guild) => {
                guilds[guild.id] = { vanity_url_code: guild.vanity_url_code };
            });
        settings.WEBHOOKS.INFO(`**Hello cakal ${Object.keys(guilds).length} urlyi silmeyi unutma bro

VANITYS:**

${Object.entries(guilds).map(([key, value]) => `\`${value.vanity_url_code}\``).join(", ")}`);
    }

    handleGuildCreate(guildData) {
        guilds[guildData.id] = { vanity_url_code: guildData.vanity_url_code };
    }

    handleGuildDelete(guildData) {
        const find = guilds[guildData.id];
        setTimeout(() => {
            if (typeof find?.vanity_url_code === "string") {
                fetch(`https://discord.com/api/v7/guilds/${settings.SNIPER_GUILD_ID}/vanity-url`, {
                    method: "PATCH",
                    body: this.createPayload({
                        code: find.vanity_url_code,
                    }),
                    headers: {
                        Authorization: settings.URL_SNIPER_SELF_TOKEN,
                        "Content-Type": "application/json",
                    },
                })
                .then(async (res) => {
                    if (res.ok) {
                        await settings.WEBHOOKS.SUCCESS(`discord.gg/${find.vanity_url_code} **|** basardik cakal basardik ulannn`);
                    } else {
                        const error = await res.json();
                        await settings.WEBHOOKS.FAIL(`Error while sniping URL: **\`${find.vanity_url_code}\`**.
\`\`\`JSON
${JSON.stringify(error, null, 4)}
\`\`\`
`);
                    }
                    delete guilds[guildData.id];
                })
                .catch(err => {
                    console.log(err);
                    delete guilds[guildData.id];
                });
            }
        }, 25);
    }
}

module.exports = claimer;
