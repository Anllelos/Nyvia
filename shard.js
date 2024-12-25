const { ShardingManager } = require("discord.js");
require("dotenv").config();

const manager = new ShardingManager(`./index.js`, {
  token: process.env.token,
  totalShards: "auto",
});

manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));
manager.spawn();

function totalMembers() {
  return client.shard
    .broadcastEval((c) =>
      c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    )
    .then((shards) =>
      shards.reduce((acc, memberCount) => acc + memberCount, 0)
    );
}

function totalGuilds() {
  return client.shard.fetchClientValues("guilds.cache.size").then((shards) => {
    return shards.reduce((acc, guilds) => acc + guilds, 0);
  });
}