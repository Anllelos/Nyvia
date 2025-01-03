const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mass-unban')
        .setDMPermission(false)
        .setDescription('Unban all members in the server. Use with caution!'),
 
    async execute(interaction, client) {
 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.user.id !== client.config.developerid) return await interaction.reply({ content: '<:cross:1271441946283610195> | You **do not** have the permission to do that!', ephemeral: true});
 
        try {
 
            const bannedMembers = await interaction.guild.bans.fetch();
 
            await Promise.all(bannedMembers.map(member => {
                return interaction.guild.members.unban(member.user.id).catch(err);
            }));
 
            return interaction.reply({ content: '<:tick:1271441993532444763> | All members have been **unbanned** from the server.', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '<:error:1271441954399453265> | An error occurred while **unbanning** members.', ephemeral: true });
        }
    }
}