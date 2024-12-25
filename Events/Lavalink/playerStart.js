const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const formatDuration = require("../../Handlers/Music/formatDuration");

function upCase(char) {
  return char.charAt(0).toUpperCase() + char.slice(1);
}

module.exports = {
  name: "playerStart",
  async execute(client, player, track) {
    const source = player.queue.current.sourceName || "unknown";

    try {
      const { Classic } = require('musicard');
      const fs = require('fs');

      const musicard = await Classic({
        thumbnailImage: track.thumbnail,
        backgroundColor: '#070707',
        progress: 10,
        progressColor: '#ff434e',
        progressBarColor: '#B3313A',
        name: track.title,
        nameColor: '#ff434e',
        author: track.author,
        authorColor: '#696969',
        startTime: '0:00',
        endTime: formatDuration(track.length, true),
        timeColor: '#ff434e',
      });
      
      fs.writeFileSync('musicard.png', musicard);
    } catch (error) {
      console.error(error);
    }

    const oldMessageId = player.nowPlayingMessageId;
    if (oldMessageId) {
      try {
        const oldMessage = await client.channels.cache.get(player.textId)?.messages.fetch(oldMessageId);
        if (oldMessage) await oldMessage.delete();
      } catch (error) {
        console.error(error);
      }
    }

    const playPauseButton = new ButtonBuilder()
      .setCustomId('playpause')
      .setLabel(player.paused ? 'Play' : 'Pause')
      .setStyle(ButtonStyle.Success);

    const skipButton = new ButtonBuilder()
      .setCustomId('skip')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Danger);

    const stopButton = new ButtonBuilder()
      .setCustomId('stop')
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger);

    const replayButton = new ButtonBuilder()
      .setCustomId('replay')
      .setLabel('Replay')
      .setStyle(ButtonStyle.Success);

    const queueButton = new ButtonBuilder()
      .setCustomId('queue')
      .setLabel('Queue')
      .setStyle(ButtonStyle.Primary);

    const shuffleButton = new ButtonBuilder()
      .setCustomId('shuffle')
      .setLabel('Shuffle')
      .setStyle(ButtonStyle.Primary);

    const forwardButton = new ButtonBuilder()
      .setCustomId('forward')
      .setLabel('+10')
      .setStyle(ButtonStyle.Success);

    const backwardButton = new ButtonBuilder()
      .setCustomId('backward')
      .setLabel('-10')
      .setStyle(ButtonStyle.Danger);
    
    const volpButton = new ButtonBuilder()
      .setCustomId('volplus')
      .setLabel('Vol +')
      .setStyle(ButtonStyle.Success);

    const volmButton = new ButtonBuilder()
      .setCustomId('volminus')
      .setLabel('Vol -')
      .setStyle(ButtonStyle.Danger);


    const row1 = new ActionRowBuilder()
      .addComponents(playPauseButton, skipButton, stopButton, forwardButton, volpButton);

    const row2 = new ActionRowBuilder()
      .addComponents(replayButton, queueButton, shuffleButton, backwardButton, volmButton);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('selectMenu')
      .setPlaceholder('Select a filter to apply.')
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel('Clear All Filters')
          .setValue('clear'),
        new StringSelectMenuOptionBuilder()
          .setLabel('8d')
          .setValue('8d'),
        new StringSelectMenuOptionBuilder()
          .setLabel('NightCore')
          .setValue('nightcore'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Soft')
          .setValue('soft'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Speed')
          .setValue('speed'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Karaoke')
          .setValue('karaoke'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Pop')
          .setValue('pop'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Vaporwave')
          .setValue('vaporwave'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Bass Boosted')
          .setValue('bass'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Party')
          .setValue('party'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Earrape')
          .setValue('earrape'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Equalizer')
          .setValue('equalizer'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Electronic')
          .setValue('electronic'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Radio')
          .setValue('radio'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Tremolo')
          .setValue('tremolo'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Treblebass')
          .setValue('treblebass'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Vibrato')
          .setValue('vibrato'),
        new StringSelectMenuOptionBuilder()
          .setLabel('China')
          .setValue('china'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Chimpunk')
          .setValue('chimpunk'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Darthvader')
          .setValue('darthvader'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Daycore')
          .setValue('daycore'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Doubletime')
          .setValue('doubletime'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Pitch')
          .setValue('pitch'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Rate')
          .setValue('rate'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Slow')
          .setValue('slow'),

      ]);

    const filters = new ActionRowBuilder()
      .addComponents(selectMenu);

    const nowPlayingMessage = await client.channels.cache.get(player.textId)?.send({ files: ['musicard.png'], components: [filters, row1, row2] });
    if (nowPlayingMessage) player.nowPlayingMessageId = nowPlayingMessage.id;

    const filter = (interaction) => interaction.customId === 'playpause' || interaction.customId === 'skip' || interaction.customId === 'stop' || interaction.customId === 'replay' || interaction.customId === 'queue' || interaction.customId === 'shuffle' || interaction.customId === 'forward' || interaction.customId === 'backward' || interaction.customId === 'volplus' || interaction.customId === 'volminus' || interaction.customId === 'selectMenu';
    const collector = nowPlayingMessage.createMessageComponentCollector({ filter });

    collector.on('collect', async (interaction) => {
      switch (interaction.customId) {
        case 'playpause':
                if (player.paused) {
                    player.pause(false);
                    playPauseButton.setLabel('Pause');
                } else {
                    player.pause(true);
                    playPauseButton.setLabel('Play');
                }
                const row1Updated = new ActionRowBuilder()
                .addComponents(playPauseButton, skipButton, stopButton);
                await interaction.update({ components: [filters, row1Updated, row2] });
        break;
        case 'skip':
          if (player.queue.size >= 1) {
            if (player.queue.current.requester.id !== interaction.user.id) {
              await interaction.reply({
                content: ":no_entry_sign: **You didn't request this song, you can't skip it!**",
                ephemeral: true
              });
            } else {
              player.skip();
              await interaction.reply({ content: `> Skipped The Song`, ephemeral: true });
            }
          } else {
            await interaction.reply({ content: 'No songs in queue to skip to!', ephemeral: true });
          }
          break;
        case 'stop':
          player.destroy();
          await interaction.reply({ content: 'Stopped the music!', ephemeral: true });
          break;
        case 'replay':
          player.seek(0);
          await interaction.reply({ content: 'Replayed the current track!', ephemeral: true });
          break;
        case 'queue':
          if (player.queue.size >= 1) {
            const queue = player.queue.map((track, index) => {
              return `**${index + 1}.** [${track.title}](${track.uri}) - **${track.author}**`;
            }).join("\n");
            const queueEmbed = new EmbedBuilder()
              .setTitle('Queue')
              .setDescription(queue)
              .setColor(client.config.embed );
            await interaction.reply({ embeds: [queueEmbed], ephemeral: true });
          } else {
            await interaction.reply({ content: 'No songs in queue!', ephemeral: true });
          }
          break;
        case 'shuffle':
          if (player.queue.size >= 1) {
            player.queue.shuffle();
            await interaction.reply({ content: 'Shuffled the queue!', ephemeral: true });
          } else {
            await interaction.reply({ content: 'No songs in queue to shuffle!', ephemeral: true });
          }
          break;
        case 'forward':
            const forwardPosition = player.position + 10000;
            if (forwardPosition > player.queue.current.length) {
              await interaction.reply({ content: 'Cannot forward beyond the song duration!', ephemeral: true });
            } else {
              player.seek(forwardPosition);
              await interaction.reply({ content: `Forwarded 10 seconds!`, ephemeral: true });
            }
          break;
        case 'backward':
            const backwardPosition = player.position - 10000;
            if (backwardPosition < 0) {
              await interaction.reply({ content: 'Cannot backward before the start of the song!', ephemeral: true });
            } else {
              player.seek(backwardPosition);
              await interaction.reply({ content: `Backwarded 10 seconds!`, ephemeral: true });
            }
          break;
        case 'volplus':
            if (player.volume < 100) {
              player.setVolume(player.volume + 10);
              await interaction.reply({ content: `Volume set to ${player.volume}%`, ephemeral: true });
            } else {
              await interaction.reply({ content: 'Volume is already at maximum', ephemeral: true });
            }
          break;
        case 'volminus':
            if (player.volume > 0) {
              player.setVolume(player.volume - 10);
              await interaction.reply({ content: `Volume set to ${player.volume}%`, ephemeral: true });
            } else {
              await interaction.reply({ content: 'Volume is already at minimum', ephemeral: true });
            }
          break;
        case 'selectMenu':
          const selectedOption = interaction.values[0];
          switch (selectedOption) {
            case 'clear':
              player.filter("clear")
              await interaction.reply({ content: `All Filters Are Cleared`, ephemeral: true });
              break;
            case 'nightcore':
              player.filter("nightcore")
              await interaction.reply({ content: `\`Nightcore\` filter enabled.`, ephemeral: true });
              break;
            case '8d':
              player.filter("eightD")
              await interaction.reply({ content: `\`8d\` filter enabled.`, ephemeral: true });
              break;
            case 'soft':
              player.filter("soft")
              await interaction.reply({ content: `\`Soft\` filter enabled.`, ephemeral: true });
              break;
            case 'speed':
              player.filter("speed")
              await interaction.reply({ content: `\`Speed\` filter enabled.`, ephemeral: true });
              break;
            case 'karaoke':
              player.filter("karaoke")
              await interaction.reply({ content: `\`Karaoke\` filter enabled.`, ephemeral: true });
              break;
            case 'pop':
              player.filter("pop")
              await interaction.reply({ content: `\`PoP\` filter enabled.`, ephemeral: true });
              break;
            case 'vaporwave':
              player.filter("vaporwave")
              await interaction.reply({ content: `\`Vaporwave\` filter enabled.`, ephemeral: true });
              break;
            case 'bass':
              player.filter("bass")
              await interaction.reply({ content: `\`Bass Boosted\` filter enabled.`, ephemeral: true });
              break;
            case 'party':
              player.filter("party")
              await interaction.reply({ content: `\`Party\` filter enabled.`, ephemeral: true });
              break;
            case 'earrape':
              player.filter("earrape")
              await interaction.reply({ content: `\`Earrape\` filter enabled.`, ephemeral: true });
              break;
            case 'equalizer':
              player.filter("equalizer")
              await interaction.reply({ content: `\`Equalizer\` filter enabled.`, ephemeral: true });
              break;
            case 'electronic':
              player.filter("electronic")
              await interaction.reply({ content: `\`Electronic\` filter enabled.`, ephemeral: true });
              break;
            case 'radio':
              player.filter("radio")
              await interaction.reply({ content: `\`Radio\` filter enabled.`, ephemeral: true });
              break;
            case 'tremolo':
              player.filter("tremolo")
              await interaction.reply({ content: `\`Tremolo\` filter enabled.`, ephemeral: true });
              break;
            case 'treblebass':
              player.filter("treblebass")
              await interaction.reply({ content: `\`TrebleBass\` filter enabled.`, ephemeral: true });
              break;
            case 'equalizer':
              player.filter("equalizer")
              await interaction.reply({ content: `\`Equalizer\` filter enabled.`, ephemeral: true });
              break;
            case 'vibrato':
              player.filter("vibrato")
              await interaction.reply({ content: `\`Vibrato\` filter enabled.`, ephemeral: true });
              break;
            case 'china':
              player.filter("china")
              await interaction.reply({ content: `\`China\` filter enabled.`, ephemeral: true });
              break;
            case 'chimpunk':
              player.filter("chimpunk")
              await interaction.reply({ content: `\`Chimpunk\` filter enabled.`, ephemeral: true });
              break;
            case 'darthvader':
              player.filter("darthvader")
              await interaction.reply({ content: `\`DarthVader\` filter enabled.`, ephemeral: true });
              break;
            case 'daycore':
              player.filter("daycore")
              await interaction.reply({ content: `\`Daycore\` filter enabled.`, ephemeral: true });
              break;
            case 'doubletime':
              player.filter("doubletime")
              await interaction.reply({ content: `\`Doubletime\` filter enabled.`, ephemeral: true });
              break;
            case 'pitch':
              player.filter("pitch")
              await interaction.reply({ content: `\`Pitch\` filter enabled.`, ephemeral: true });
              break;
            case 'rate':
              player.filter("rate")
              await interaction.reply({ content: `\`Rate\` filter enabled.`, ephemeral: true });
              break;
            case 'slow':
              player.filter("slow")
              await interaction.reply({ content: `\`Slow\` filter enabled.`, ephemeral: true });
              break;
              
          }
          break;
      }
    });

  },
};