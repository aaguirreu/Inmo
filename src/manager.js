const { Manager } = require("erela.js");
const {MessageEmbed} = require("discord.js");
var embedAux = null

module.exports = function (client) {
  return new Manager({
    nodes: [
      {
        host: "lavalink-node.herokuapp.com",
        //host: "lavalink-graljadue.herokuapp.com",
        //host: "localhost",
        port: 80,
        password: "pichulajadue",
      },
    ],
    send(id, payload) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  })
    .on("nodeConnect", (node) =>{ 
      console.log(`Node ${node.options.identifier} connected`) 
    }
    )

    .on("nodeError", (node, error) =>
      console.log(
        `Node ${node.options.identifier} had an error: ${error.message}`
      )
    )
    
    .on("trackStart", async (player, track)  => {
      if (embedAux !== null) embedAux.delete()
      createEmbed(player, track)
        console.log(`Estás escuchando: [${track.title}]`)
    })
    
    .on("queueEnd", (player) => {
      client.channels.cache.get(player.textChannel);//.send("Queue has ended.");
      console.log("Queue has ended.");
      setTimeout(() => player.destroy(), 30000)
    });

    function createEmbed(player, track) {
      
      const filter = (reaction, user) => { //agrega los emoji de numeros al filter
        //return '🔁' && client.channels.cache.get(player.textChannel).members.includes(user.id);
        return '🔁' && user.id != '844403422894882846';
      };
      const embed = new MessageEmbed()
          const trackname = track.title
          var durSec = Math.trunc(track.duration/1000%60-1);
          if (durSec < 0) durSec = 0
          embed.setTitle(':arrow_forward:  Estás escuchando  :musical_note: :sweat_drops:')
          embed.setDescription(`[${track.title}](${track.uri}) :two_hearts:`)
          embed.setFooter({text:`${0}:${0}${0}/${0}:${Math.trunc(durSec/10)}${Math.trunc(durSec%10)}`})
          embed.setColor("DARK_RED");
          client.channels.cache.get(player.textChannel).send({ embeds: [embed] })
          .then(sentEmbed => {
            var aux = -1
            var trackname = track.title
            timeline(track.title)
            function timeline (trackname) {
                var posMin = Math.trunc(player.position/1000/60);
                var posSec = Math.trunc(player.position/1000%60 - 1);
                if (posSec < 0) posSec = 0
                var durMin = Math.trunc(track.duration/1000/60);
                var durSec = Math.trunc(track.duration/1000%60-1);
                if (durSec < 0) durSec = 0
                aux = posSec
                embed.setTitle(':arrow_forward:  Estás escuchando  :musical_note: :sweat_drops:')
                embed.setDescription(`[${track.title}](${track.uri}) :two_hearts:`)
                embed.setFooter({text: `${Math.trunc(posMin)}:${Math.trunc(posSec/10)}${Math.trunc(posSec%10)}/${Math.trunc(durMin)}:${Math.trunc(durSec/10)}${Math.trunc(durSec%10)}`})
                embed.setColor("DARK_RED");
                sentEmbed.edit({ embeds: [embed] })
                .then(sentEmbed.react("🔁"))
                  embedAux = sentEmbed
                  const collector = sentEmbed.awaitReactions({ filter, max: 1, time: track.duration, errors: ['time'] })
                  .then(collected => {
                    const reaction = collected.first();
                    var tracknameaux = trackname
                    if (reaction.emoji.name === "🔁") {
                      sentEmbed.reactions.removeAll()
                      return timeline(track.title)
                  }
                  }).catch(collected =>{
                  })
            }
          })
    }
};

