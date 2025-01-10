const { ChannelType, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const TicketSchema = require('../../Schemas/Ticket');
const TicketSetup = require('../../Schemas/TicketSetup');
const config = require('../../ticketconfig');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.guild) return;
        const { guild, member, customId } = interaction;

        if (!interaction.isButton()) return;

        const data = await TicketSetup.findOne({ GuildID: guild.id });
        if (!data) {
            console.log(`No ticket setup found for guild: ${guild.id}`);
            return;
        }

        if (!data.Button.includes(customId)) {
            console.log(`Button ID ${customId} not found in ticket setup for guild: ${guild.id}`);
            return;
        }

        const alreadyticketEmbed = new EmbedBuilder().setDescription(config.ticketAlreadyExist).setColor('Red');
        const findTicket = await TicketSchema.findOne({ GuildID: guild.id, OwnerID: member.id });
        if (findTicket) return interaction.reply({ embeds: [alreadyticketEmbed], ephemeral: true }).catch(error => { return; });

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'Sorry, I don\'t have permissions.', ephemeral: true }).catch(error => { return; });
        }

        const ticketId = Math.floor(Math.random() * 9000) + 10000;

        try {
            const channel = await guild.channels.create({
                name: config.ticketName + ticketId,
                type: ChannelType.GuildText,
                parent: data.Category,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: data.Handlers,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
                    },
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                ],
            });

            await TicketSchema.create({
                GuildID: guild.id,
                OwnerID: member.id,
                MemberID: member.id,
                TicketID: ticketId,
                ChannelID: channel.id,
                Locked: false,
                Claimed: false,
            });

            await channel.setTopic(config.ticketDescription + ' <@' + member.id + '>').catch(error => { return; });
            const embed = new EmbedBuilder().setTitle(config.ticketMessageTitle).setDescription(config.ticketMessageDescription);
            const button = new ActionRowBuilder().setComponents(
                new ButtonBuilder().setCustomId('ticket-close').setLabel(config.ticketClose).setStyle(ButtonStyle.Danger).setEmoji(config.ticketCloseEmoji),
                new ButtonBuilder().setCustomId('ticket-lock').setLabel(config.ticketLock).setStyle(ButtonStyle.Secondary).setEmoji(config.ticketLockEmoji),
                new ButtonBuilder().setCustomId('ticket-unlock ').setLabel(config.ticketUnlock).setStyle(ButtonStyle.Secondary).setEmoji(config.ticketUnlockEmoji),
                new ButtonBuilder().setCustomId('ticket-manage').setLabel(config.ticketManage).setStyle(ButtonStyle.Secondary).setEmoji(config.ticketManageEmoji),
                new ButtonBuilder().setCustomId('ticket-claim').setLabel(config.ticketClaim).setStyle(ButtonStyle.Primary).setEmoji(config.ticketClaimEmoji),
            );

            await channel.send({ embeds: [embed], components: [button] }).catch(error => { return; });
            const handlersMention = await channel.send({ content: '<@&' + data.Handlers + '>' });
            handlersMention.delete().catch(error => { return; });

            const ticketMessage = new EmbedBuilder().setDescription(config.ticketCreate + ' <#' + channel.id + '>').setColor('Green');
            interaction.reply({
                embeds: [ticketMessage],
                components: [new ActionRowBuilder().setComponents(new ButtonBuilder().setURL(`https://discord.com/channels/${guild.id}/${channel.id}`).setLabel(config.ticketButtonCreated).setStyle(ButtonStyle.Link).setEmoji(config.ticketButtonCreatedEmoji))],
                ephemeral: true
            }).catch(error => { return; });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while creating the ticket.', ephemeral: true });
        }
    }
}