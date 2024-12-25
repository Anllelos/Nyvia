const { SlashCommandBuilder, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const suggestion = require('../../Schemas/suggestionSchema');
const formatResults = require('../../Handlers/formatResults');

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.isButton) return;

    const data = await suggestion.findOne({ GuildID: interaction.guild.id, Msg: interaction.message.id });
    if (!data) return;
    const message = await interaction.channel.messages.fetch(data.Msg);

    if (interaction.customId == 'upv') {
        if (data.Upmembers.includes(interaction.user.id)) return await interaction.reply({content: `You cannot vote again! You have already sent an upvote on this suggestion.`, ephemeral: true});

        let Downvotes = data.downvotes;
        if (data.Downmembers.includes(interaction.user.id)) {
            Downvotes = Downvotes - 1;
        }

        if (data.Downmembers.includes(interaction.user.id)) {

            data.downvotes = data.downvotes - 1;
        }

        data.Upmembers.push(interaction.user.id);
        data.Downmembers.pull(interaction.user.id);
        
        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `Upvotes`, value: `> **${data.upvotes + 1}** Votes`, inline: true}, { name: `Downvotes`, value: `> **${Downvotes}** Votes`, inline: true}, {name: `Author`, value: `> <@${data.AuthorID}>`}, { name: `Votes`, value: formatResults(data.Upmembers, data.Downmembers)});

        const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('upv')
                    .setLabel('Upvotes')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<:like:1280886644677017643>'),

                    new ButtonBuilder()
                    .setCustomId('downv')
                    .setEmoji('<:dislike:1280886648409952347>')
                    .setLabel('Downvotes')
                    .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                    .setCustomId('totalvotes')
                    .setEmoji('<a:votes:1280891397087563809>')
                    .setLabel('Votes')
                    .setStyle(ButtonStyle.Secondary)
                )

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Approve')
                    .setEmoji('<a:tick:1280026463386468445>')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji('<a:cross:1280026542453297302>')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                )
                
                await interaction.update({ embeds: [newEmbed], components: [button, button2] });

                data.upvotes++;
                data.save();
    }

    if (interaction.customId == 'downv') {

        if (data.Downmembers.includes(interaction.user.id)) return await interaction.reply({ content: `You cannot down vote twice on this suggestion!`, ephemeral: true});

        let Upvotes = data.upvotes;
        if (data.Upmembers.includes(interaction.user.id)) {
            Upvotes = Upvotes - 1;
        }

        if (data.Upmembers.includes(interaction.user.id)) {

            data.upvotes = data.upvotes - 1;
        }

        data.Downmembers.push(interaction.user.id);
        data.Upmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `Upvotes`, value: `> **${Upvotes}** Votes`, inline: true}, { name: `Downvotes`, value: `> **${data.downvotes + 1}** Votes`, inline: true}, {name: `Author`, value: `> <@${data.AuthorID}>`}, { name: `Votes`, value: formatResults(data.Upmembers, data.Downmembers)});

        const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('upv')
                    .setLabel('Upvotes')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<:tup:1162598259626352652>'),

                    new ButtonBuilder()
                    .setCustomId('downv')
                    .setEmoji('<:tdown:1162598331390889994>')
                    .setLabel('Downvotes')
                    .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                    .setCustomId('totalvotes')
                    .setEmoji('💭')
                    .setLabel('Votes')
                    .setStyle(ButtonStyle.Secondary)
                )

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Approve')
                    .setEmoji('<a:AUSC_checked:1011088709266985110>')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji('<a:rejected:1162622460835922043>')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                )
                
                await interaction.update({ embeds: [newEmbed], components: [button, button2] });

                data.downvotes++;
                data.save();
    }

    if (interaction.customId == 'totalvotes') {

        let upvoters = [];
        await data.Upmembers.forEach(async member => {
            upvoters.push(`<@${member}>`)
        });

        let downvoters = [];
        await data.Downmembers.forEach(async member => {
            downvoters.push(`<@${member}>`)
        });

        const embed = new EmbedBuilder()
        .addFields({ name: `Upvoters (${upvoters.length})`, value: `> ${upvoters.join(', ').slice(0, 1020) || `No upvoters!`}`, inline: true})
        .addFields({ name: `Downvoters (${downvoters.length})`, value: `> ${downvoters.join(', ').slice(0, 1020) || `No downvoters!`}`, inline: true})
        .setColor(client.config.embed)
        .setTimestamp()
        .setFooter({ text: `💭 Vote Data`})
        .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId == 'appr') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).addFields({ name: 'Status:', value: '> __***<a:tick:1280026463386468445> Your suggestion has been approved!***__', inline: true })

        await interaction.update({ embeds: [newEmbed], components: [message.components[0]] });
    }

    if (interaction.customId == 'rej') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).addFields({ name: 'Status:', value: '> __***<a:tick:1280026463386468445> <a:cross:1280026542453297302> Your suggestion has been rejected!***__', inline: true })

        await interaction.update({ embeds: [newEmbed], components: [message.components[0]] });
    }
    }
}