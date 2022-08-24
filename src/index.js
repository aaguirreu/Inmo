require("dotenv").config();
const { Client, MessageEmbed, Message, CommandInteractionOptionResolver} = require("discord.js");
const client = new Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS","GUILD_EMOJIS_AND_STICKERS", "GUILD_INTEGRATIONS",
"GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING"] });
client.manager = require("./manager")(client);
const {token, clientId, guildId} = require('../config.json');
const { setTimeout } = require("timers");
const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType } = require('discord-api-types/v9');
const youtubeSuggest = require('youtube-suggest');
const { timeStamp } = require("console");


const commands = [{
  name: 'play',
  description: 'reproduce música.',
  options: [{
    name: 'song',
    description: 'buscar canción.',
    required: true,
    autocomplete: true,
    type: ApplicationCommandOptionType.String,
  }]
},
  {
    name: 'skip',
    description: 'skipea una canción',
  },
  {
    name: 'clear',
    description: 'borra la queue',
  }
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Registra comandos en una guild
    /*await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );*/

    //Registra comandos en todas las guilds (global)
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log("Discord Bot has logged in.");
  client.manager.init(client.user.id);
})

client.login(token);

client.on("raw", (d) => client.manager.updateVoiceState(d));

client.on('interactionCreate', async interaction => {

  //Autocomplete suggestions
  if (interaction.isAutocomplete && interaction.type === 'APPLICATION_COMMAND_AUTOCOMPLETE') { // 'APPLICATION_COMMAND'' isAutocomplete entra igual y crashea.

    if(!interaction.options.getString('song')) return;
    //console.log(interaction)
    //console.log('-----------------------------')
    youtubeSuggest(interaction.options.getString('song')).then(function (results) { //YT Suggestions
    //assert(Array.isArray(results))
    //assert(typeof results[0] === 'string')
    for (let i = 0; i < results.length; i++) { //Hace que no crashee por 'Invalid body form'
      if(typeof results[i] !== 'string') {
        if (i == results.length - 1) {
          interaction.respond([{
            name: 'sin resultados',
            value: ' '
          }])
        }
        return;
      }
    }
    const respond = []
    for (let i = 0; i < results.length; i++) { // Suggests
      respond.push({name: results[i], value: results[i]})
    }
    interaction.respond(respond)
    })
  }

  //return si no es comando
  if (!interaction.isCommand()) return;

  ///play canciones.
  if (interaction.commandName === 'play') {
    try {
      const res = await client.manager.search(
        interaction.options.getString('song'),
        interaction.guild.members.cache.get(interaction.user.id).user.username
      )
      player = client.manager.create({
      guild: interaction.guild.id,
      voiceChannel: interaction.guild.members.cache.get(interaction.user.id).voice.channel.id,
      //voiceChannel: message.guild.channels.cache.find(r => r.id === "812476431170535424").id,
      textChannel: interaction.channel.id,
      });
      //ver si esto dejarlo o no
      client.manager.init(client.user.id);

      if(!res.playlist) {
        player.queue.add(res.tracks[0]);
        if (!player.playing && !player.paused /*&& !player.queue.length*/) {player.connect(); player.play() }
        await interaction.reply('Working on it')
        await interaction.editReply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha ponío [${res.tracks[0].title}](${res.tracks[0].uri})`)
        console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha ponío ${res.tracks[0].title}`)
      } else {
        player.queue.add(res.tracks);
        if (!player.playing && !player.paused /*&& !player.queue.length*/) {player.connect(); player.play() }
        await interaction.reply('Working on it')
        await interaction.editReply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha ponío ${res.tracks.length} canciones a la cola.\nPlaylist: [${res.playlist.name}](${interaction.options.getString('song')})`)
        console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha ponío ${res.tracks.length} canciones a la cola.\nPlaylist: [${res.playlist.name}](${interaction.options.getString('song')})`)
      } 
      } catch (error) {
        console.log(error)
      }
  }
  
  // skipea la canción
  if (interaction.commandName === 'skip') {
    const player = client.manager.players.get(interaction.guild.id);
    if(player) {
      player.stop();
      await interaction.reply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} skipeó la canción`)
      console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} skipeó la canción`)
    } else {
      await interaction.reply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} no hay canciones sonando`)
      console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} no hay canciones sonando`)
    }
    
  }

  if (interaction.commandName === 'clear') {
    const player = client.manager.players.get(interaction.guild.id);
    if(player) {
      player.queue.clear();
      await interaction.reply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha borrado la queue`)
      console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} ha borrado la queue`)
    } else {
      await interaction.reply(`${interaction.guild.members.cache.get(interaction.user.id).displayName} no hay canciones en la queue`)
      console.log(`${interaction.guild.members.cache.get(interaction.user.id).displayName} no hay canciones en la queue`)
    }
  }

});

//Conecta al voice
client.on('voiceStateUpdate', (oldState, newState) => {
  // check for bot
  if (oldState.member.user.bot) {
    if (oldState.member.id === "547905866255433758" || oldState.member.id === "201503408652419073") {
      if (oldState.member.voice.channel != null) {
        console.log(`${oldState.member.displayName} se ha conectado.`)
        setTimeout(() => oldState.member.voice.disconnect(), 1000)
        console.log(`${oldState.member.displayName} ha sido desconectado.`)
      }
    }
  }
  // the rest of your code
})
