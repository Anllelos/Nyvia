const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { RsnChat } = require('rsnchat');
const client = require('../../index')
const rsnchat = new RsnChat(client.config.imagegenapi); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Generates an image based on your prompt.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The description of the image you want to create.')
                .setRequired(true))
        .addStringOption(option => 
    option.setName('model')
        .setDescription('Select the image generation model.')
        .setRequired(true)
        .addChoices(
            { name: 'Absolute Reality v16', value: 'absolutereality_V16.safetensors [37db0fc3]' },
            { name: 'Absolute Reality v18.1', value: 'absolutereality_v181.safetensors [3d9d4d2b]' },
            { name: 'Dreamlike anime v1.0', value: 'dreamlike-anime-1.0.safetensors [4520e090]' },
            { name: 'Dreamlike Diffusion v1.0', value: 'dreamlike-diffusion-1.0.safetensors [5c9fd6e0]' },
            { name: 'Dreamlike Photoreal v2.0', value: 'dreamlike-photoreal-2.0.safetensors [fdcf65e7]' },
            { name: 'Dreamshaper', value: 'dreamshaper_6BakedVae.safetensors [114c8abb]' }
        )
),
premiumOnly: true,

    async execute(interaction, client) {
        const prompt = interaction.options.getString('prompt');
        const selectedModel = interaction.options.getString('model');
        const negative_prompt = "blurry, bad quality"; 

        try {
            const imageResponse = await rsnchat.prodia(prompt, negative_prompt, selectedModel); 
            
            if (imageResponse.imageUrl) {
                const embed = new EmbedBuilder()
                    .setImage(imageResponse.imageUrl);

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Image generation failed. Please try again or check your API credentials.' });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred during image generation. Please try again later.'});
        }
    }
};