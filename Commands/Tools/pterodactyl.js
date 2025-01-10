const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const Schema = require('../../Schemas/ptero');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pterodactyl')
        .setDescription('Manage your pterodactyl server easily.')
        .addSubcommand(sub => 
            sub
            .setName('help')
            .setDescription('Shows information on how to use the pterodactyl command.')
        )
        .addSubcommandGroup(g => g
            .setName('account')
            .setDescription('Manage your pterodactyl API Configuration.')
            .addSubcommand(c => c
                .setName('create')
                .setDescription('Create the configuration needed for the API interactions.')
                .addStringOption(o => o.setName('panel-url').setDescription('The URL of the panel.').setRequired(true))
                .addStringOption(o => o.setName('api-key').setDescription('Your API Key from the panel. (Account -> API -> Create API Key)').setRequired(true))
            )
            .addSubcommand(c => c
                .setName('edit')
                .setDescription('Edit your credentials.')
                .addStringOption(o => o.setName('panel-url').setDescription('The URL of the panel.').setRequired(true))
                .addStringOption(o => o.setName('api-key').setDescription('Your API Key from the panel. (Account -> API -> Create API Key)').setRequired(true))
            )
            .addSubcommand(c => c
                .setName('delete')
                .setDescription('Removes your configuration from our database.')
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-account')
            .setDescription('The client account API interactions.')
            .addSubcommand(c => c
                .setName('details')
                .setDescription('Gets the details of your account.')
            )
            .addSubcommand(c => c
                .setName('2fa-details')
                .setDescription('Gets your 2FA details.')
            )
            .addSubcommand(c => c
                .setName('update-email')
                .setDescription('Updates the email to login on the panel.')
                .addStringOption(o => o
                    .setName('email')
                    .setDescription('The email you would like to have on the panel.')
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('current-password')
                    .setDescription('The password you have right now on the panel.')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('update-password')
                .setDescription('Updates the password to login on the panel.')
                .addStringOption(o => o
                    .setName('current-password')
                    .setDescription('The password you have right now on the panel.')
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('password')
                    .setDescription('The password you would like to have on the panel.')
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('confirm-password')
                    .setDescription('Confirm the password you would like to have on the panel.')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('api-keys')
                .setDescription('Lists your current API Keys with all attributes.')
            )
            .addSubcommand(c => c
                .setName('create-api-key')
                .setDescription('Creates an API Key on your account.')
                .addStringOption(o => o
                    .setName('description')
                    .setDescription('The description of the api key. (e.g. Development API Key)')
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('allowed-ips')
                    .setDescription('The IPv4 addresses which are allowed to interact with the API Key.')
                    .setRequired(false)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server')
            .setDescription('Interacts with the servers on your account.')
            .addSubcommand(c => c
                .setName('server-details')
                .setDescription('Gets details of a server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('console-details')
                .setDescription('Gets the console details (utilization).')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('ressource-usage')
                .setDescription('Displays the resource usage of a given server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('command')
                .setDescription('Sends a command to the server to execute.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('command')
                    .setDescription('The command you want to send to the server.')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('power')
                .setDescription('Send a power signal to the server.')
                .addStringOption(o => o
                    .setName('signal')
                    .setDescription('The power signal.')
                    .setRequired(true)
                    .addChoices(
                        { name: "Kill - Instantly end the server process", value: "kill"},
                        { name: "Restart - Stops then starts the server", value: "restart"},
                        { name: "Stop - Gracefully stops the server", value: "stop"},
                        { name: "Start - Starts the server", value: "start"}
                    )
                )
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-db')
            .setDescription('Interacts with the servers database on your account.')
            .addSubcommand(c => c
                .setName('list')
                .setDescription('Lists all databases of a server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-file')
            .setDescription('Interacts with the servers files on your account.')
            .addSubcommand(c => c
                .setName('list')
                .setDescription('Lists all files of a server (root directory).')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('upload')
                .setDescription('Uploads a file to the server root directory.')
                .addAttachmentOption(o => o
                    .setName('file')
                    .setDescription('Select a file to upload on the server.')
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-network')
            .setDescription('Interacts with the servers network on your account.')
            .addSubcommand(c => c
                .setName('list')
                .setDescription('Lists all allocations on the server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-users')
            .setDescription('Interacts with the servers on your account.')
            .addSubcommand(c => c
                .setName('list')
                .setDescription('Lists all sub users on a server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-backups')
            .setDescription('Interacts with the servers on your account.')
            .addSubcommand(c => c
                .setName('list')
                .setDescription('Lists all backups of your server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('create')
                .setDescription('Creates a backup on your server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(g => g
            .setName('client-api-server-settings')
            .setDescription('Interacts with the servers on your account.')
            .addSubcommand(c => c
                .setName('rename')
                .setDescription('Rename your server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
                .addStringOption(o => o
                    .setName('name')
                    .setDescription('The new name of the server')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('reinstall')
                .setDescription('Reinstall the server.')
                .addStringOption(o => o
                    .setName('server')
                    .setDescription('The server identifier.')
                    .setAutocomplete(true)
                    .setRequired(true)
                )
            )
        ),

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const { options, user } = interaction;
        const subcommandGroup = options.getSubcommandGroup(false);
        const subcommand = options.getSubcommand(false);

        //Help command
        if (!subcommandGroup && subcommand === 'help') {
            return interaction.reply({
                content: `
                **Pterodactyl Command Help**
                To get started, use \`/pterodactyl account create\` with your panel URL and API key.
                **Account Management:**
                - \`/pterodactyl account create\` - Store your panel URL and API key.
                - \`/pterodactyl account edit\` - Update your stored credentials.
                - \`/pterodactyl account delete\` - Remove your credentials from our database.
                
                **Client API Interactions:**
                - \`/pterodactyl client-api-account\` - Manage your account details, 2FA, email, password, and API keys.
                - \`/pterodactyl client-api-server\` - Manage servers: details, console, resources, commands, power actions, backups, etc.
                - \`/pterodactyl client-api-server-db\` - Manage your server's databases.
                - \`/pterodactyl client-api-server-file\` - Manage your server's files (list or upload).
                - \`/pterodactyl client-api-server-network\` - Manage server network allocations.
                - \`/pterodactyl client-api-server-users\` - Manage sub users on your servers.
                - \`/pterodactyl client-api-server-backups\` - Manage backups of your servers.
                - \`/pterodactyl client-api-server-settings\` - Rename or reinstall your server.
                
                Use each subcommand for more specific instructions. Your credentials are private and only accessible by you.
                `,
                ephemeral: true
            });
        }

        //Handle account subcommands
        if (subcommandGroup === 'account') {
            if (subcommand === 'create') {
                const panelURL = options.getString('panel-url', true);
                const apiKey = options.getString('api-key', true);
                const existing = await Schema.findOne({ discordId: user.id });
                if (existing) {
                    return interaction.reply({ 
                        content: 'You already have a configuration. Use `/pterodactyl account edit` to update it.',
                        ephemeral: true
                    });
                }

                await Schema.create({ discordId: user.id, panelURL, apiKey });
                return interaction.reply({
                    content: 'Your Pterodactyl credentials have been saved successfully!',
                    ephemeral: true
                });
            }

            if (subcommand === 'edit') {
                const panelURL = options.getString('panel-url', true);
                const apiKey = options.getString('api-key', true);

                const existing = await Schema.findOne({ discordId: user.id });
                if (!existing) {
                    return interaction.reply({
                        content: 'You have no stored credentials. Use `/pterodactyl account create` first.',
                        ephemeral: true
                    });
                }

                existing.panelURL = panelURL;
                existing.apiKey = apiKey;
                await existing.save();

                return interaction.reply({
                    content: 'Your Pterodactyl credentials have been updated!',
                    ephemeral: true
                });
            }

            if (subcommand === 'delete') {
                const existing = await Schema.findOne({ discordId: user.id });
                if (!existing) {
                    return interaction.reply({
                        content: 'You have no stored credentials.',
                        ephemeral: true
                    });
                }

                await Schema.deleteOne({ discordId: user.id });

                return interaction.reply({
                    content: 'Your credentials have been successfully removed.',
                    ephemeral: true
                });
            }
            return;
        }

        //For all other subcommands, we need user credentials
        const credentials = await Schema.findOne({ discordId: user.id });
        if (!credentials) {
            return interaction.reply({
                content: 'You must first set your panel URL and API key using `/pterodactyl account create`.',
                ephemeral: true
            });
        }

        const { panelURL, apiKey } = credentials;
        const axiosInstance = axios.create({
            baseURL: panelURL.replace(/\/$/, ""),
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        //Helper function for error handling
        const handleError = (err, interaction) => {
            console.error(err);
            const msg = err.response?.data?.errors?.[0]?.detail || err.message || 'An error occurred.';
            return interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
        };

        //CLIENT-API-ACCOUNT
        if (subcommandGroup === 'client-api-account') {
            try {
                if (subcommand === 'details') {
                    const res = await axiosInstance.get('/api/client/account');
                    const d = res.data.attributes;
                    return interaction.reply({
                        content: `**Account Details**\nUsername: ${d.username}\nEmail: ${d.email}\nLanguage: ${d.language}`,
                        ephemeral: true
                    });
                }

                if (subcommand === '2fa-details') {
                    const res = await axiosInstance.get('/api/client/account/two-factor');
                    const d = res.data.data;
                    if (!d || d.length === 0) {
                        return interaction.reply({
                            content: '2FA is not enabled on your account.',
                            ephemeral: true
                        });
                    }
                    //Redacted codes for security
                    return interaction.reply({
                        content: `2FA is enabled on your account.`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'update-email') {
                    const email = options.getString('email', true);
                    const currentPassword = options.getString('current-password', true);

                    await axiosInstance.put('/api/client/account/email', {
                        email: email,
                        password: currentPassword
                    });
                    return interaction.reply({
                        content: `Your email has been updated to ${email}.`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'update-password') {
                    const currentPassword = options.getString('current-password', true);
                    const password = options.getString('password', true);
                    const confirmPassword = options.getString('confirm-password', true);

                    if (password !== confirmPassword) {
                        return interaction.reply({
                            content: 'Passwords do not match.',
                            ephemeral: true
                        });
                    }

                    await axiosInstance.put('/api/client/account/password', {
                        current_password: currentPassword,
                        password: password,
                        password_confirmation: confirmPassword
                    });
                    return interaction.reply({
                        content: 'Your password has been updated successfully.',
                        ephemeral: true
                    });
                }

                if (subcommand === 'api-keys') {
                    const res = await axiosInstance.get('/api/client/account/api-keys');
                    const keys = res.data.data;
                    if (keys.length === 0) return interaction.reply({ content: 'No API keys found.', ephemeral: true });
                    const list = keys.map(k => `**${k.attributes.description}** - Last used: ${k.attributes.last_used_at || 'Never'}`).join('\n');
                    return interaction.reply({ content: `Your API keys:\n${list}`, ephemeral: true });
                }

                if (subcommand === 'create-api-key') {
                    const description = options.getString('description', true);
                    const allowedIps = options.getString('allowed-ips', false) || null;

                    const body = { description, allowed_ips: allowedIps ? [allowedIps] : [] };
                    const res = await axiosInstance.post('/api/client/account/api-keys', body);
                    const key = res.data.meta.secret_token;
                    //Do not store or show this key publicly
                    return interaction.reply({
                        content: `API key created: \`${description}\`. Make sure to copy it now: \`${key}\` (Will not be shown again).`,
                        ephemeral: true
                    });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER
        if (subcommandGroup === 'client-api-server') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'server-details') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}`);
                    const s = res.data.attributes;
                    return interaction.reply({
                        content: `**Server Details**\nName: ${s.name}\nIdentifier: ${s.identifier}\nNode: ${s.node}\nDescription: ${s.description || 'None'}`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'console-details') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/utilization`);
                    const u = res.data.attributes;
                    return interaction.reply({
                        content: `**Console Details**\nState: ${u.state}\nCPU: ${u.cpu_absolute}%\nMemory: ${u.memory_bytes} bytes\nDisk: ${u.disk_bytes} bytes`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'ressource-usage') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/utilization`);
                    const u = res.data.attributes;
                    return interaction.reply({
                        content: `**Resource Usage**\nState: ${u.state}\nCPU: ${u.cpu_absolute}%\nMemory: ${u.memory_bytes} bytes\nDisk: ${u.disk_bytes} bytes`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'command') {
                    const command = options.getString('command', true);
                    await axiosInstance.post(`/api/client/servers/${server}/command`, { command });
                    return interaction.reply({
                        content: `Command \`${command}\` sent to the server.`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'power') {
                    const signal = options.getString('signal', true);
                    await axiosInstance.post(`/api/client/servers/${server}/power`, { signal });
                    return interaction.reply({
                        content: `Power signal \`${signal}\` sent to the server.`,
                        ephemeral: true
                    });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER-DB
        if (subcommandGroup === 'client-api-server-db') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'list') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/databases`);
                    const dbs = res.data.data;
                    if (dbs.length === 0) return interaction.reply({ content: 'No databases found.', ephemeral: true });
                    const list = dbs.map(d => `Name: ${d.attributes.name}\nUsername: ${d.attributes.username}\nHost: ${d.attributes.host.address}\n---`).join('\n');
                    return interaction.reply({ content: `**Databases**:\n${list}`, ephemeral: true });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER-FILE
        if (subcommandGroup === 'client-api-server-file') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'list') {
                    //List files in root directory
                    const res = await axiosInstance.get(`/api/client/servers/${server}/files/list?directory=/`);
                    const files = res.data.data;
                    if (files.length === 0) return interaction.reply({ content: 'No files found.', ephemeral: true });
                    const list = files.map(f => `${f.attributes.is_file ? 'File' : 'Dir'}: ${f.attributes.name}`).join('\n');
                    return interaction.reply({ content: `**Files in root**:\n${list}`, ephemeral: true });
                }

                if (subcommand === 'upload') {
                    const file = interaction.options.getAttachment('file', true);
                    //Fetch the file from Discord
                    const fileData = await axios.get(file.url, { responseType: 'arraybuffer' });
                    const form = new FormData();
                    form.append('files', fileData.data, file.name);
                    form.append('directory', '/');
                    form.append('file', file.name);

                    const uploadURL = `${panelURL.replace(/\/$/, "")}/api/client/servers/${server}/files/upload`;
                    await axios.post(uploadURL, form, {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Accept': 'application/json',
                            ...form.getHeaders()
                        }
                    });

                    return interaction.reply({
                        content: `File \`${file.name}\` uploaded successfully.`,
                        ephemeral: true
                    });
                }

            } catch (err) {
                return handleError(err, interaction);
            }
        }

        /*
true
500365
4ADRI3L
29648
184761
1736522047
c92c171738798e98c3932fea44bdf86f
*/

        //CLIENT-API-SERVER-NETWORK
        if (subcommandGroup === 'client-api-server-network') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'list') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/network/allocations`);
                    const allocations = res.data.data;
                    if (allocations.length === 0) return interaction.reply({ content: 'No allocations found.', ephemeral: true });
                    const list = allocations.map(a => `${a.attributes.ip}:${a.attributes.port} | Notes: ${a.attributes.notes || 'None'}`).join('\n');
                    return interaction.reply({ content: `**Allocations**:\n${list}`, ephemeral: true });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER-USERS
        if (subcommandGroup === 'client-api-server-users') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'list') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/users`);
                    const users = res.data.data;
                    if (users.length === 0) return interaction.reply({ content: 'No sub users found.', ephemeral: true });
                    const list = users.map(u => `Email: ${u.attributes.email} | 2FA: ${u.attributes.two_factor_enabled}`).join('\n');
                    return interaction.reply({ content: `**Sub Users**:\n${list}`, ephemeral: true });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER-BACKUPS
        if (subcommandGroup === 'client-api-server-backups') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'list') {
                    const res = await axiosInstance.get(`/api/client/servers/${server}/backups`);
                    const backups = res.data.data;
                    if (backups.length === 0) return interaction.reply({ content: 'No backups found.', ephemeral: true });
                    const list = backups.map(b => `${b.attributes.uuid} | Locked: ${b.attributes.is_locked} | Created: ${b.attributes.created_at}`).join('\n');
                    return interaction.reply({ content: `**Backups**:\n${list}`, ephemeral: true });
                }

                if (subcommand === 'create') {
                    await axiosInstance.post(`/api/client/servers/${server}/backups`);
                    return interaction.reply({
                        content: 'Backup creation initiated.',
                        ephemeral: true
                    });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        //CLIENT-API-SERVER-SETTINGS
        if (subcommandGroup === 'client-api-server-settings') {
            const server = options.getString('server', true);
            try {
                if (subcommand === 'rename') {
                    const name = options.getString('name', true);
                    await axiosInstance.put(`/api/client/servers/${server}/settings/rename`, {
                        name
                    });
                    return interaction.reply({
                        content: `Server renamed to \`${name}\`.`,
                        ephemeral: true
                    });
                }

                if (subcommand === 'reinstall') {
                    await axiosInstance.post(`/api/client/servers/${server}/settings/reinstall`);
                    return interaction.reply({
                        content: 'Server reinstall initiated.',
                        ephemeral: true
                    });
                }
            } catch (err) {
                return handleError(err, interaction);
            }
        }

        return interaction.reply({
            content: 'Subcommand not recognized or not implemented.',
            ephemeral: true
        });
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */