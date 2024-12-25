const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleall')
        .setDescription('Assigns a specified role to members in the server.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('humans')
                .setDescription('Assigns a specified role to all human members.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to assign to all human members.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bots')
                .setDescription('Assigns a specified role to all bot members.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to assign to all bot members.')
                        .setRequired(true)
                )
        ),
        
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const botMember = interaction.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
        }

        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: 'I cannot assign this role because it is higher than my highest role.', ephemeral: true });
        }

        const members = await interaction.guild.members.fetch();
        const successMessages = [];
        const failureMessages = [];

        const isHumansCommand = interaction.options.getSubcommand() === 'humans';

        for (const member of members.values()) {
            const isBot = member.user.bot;

            if ((isHumansCommand && !isBot) || (!isHumansCommand && isBot)) {
                if (!member.roles.cache.has(role.id)) {
                    try {
                        await member.roles.add(role);
                        successMessages.push(`${member.displayName} has been given the role ${role.name}.`);
                    } catch (error) {
                        console.error(`Failed to assign role to ${member.displayName}: ${error}`);
                        failureMessages.push(`Failed to assign role to ${member.displayName}.`);
                    }
                }
            }
        }

        const replyMessage = [
            ...successMessages,
            ...failureMessages.length ? failureMessages : []
        ].join('\n') || 'No members were found to assign the role to. Or make sure the bot\'s role is higher than the role you are giving.';

        await interaction.reply({ content: replyMessage, ephemeral: true });
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */