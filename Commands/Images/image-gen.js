const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RsnChat } = require('rsnchat');
const { RsnFilter } = require('rsn-filter');
const client = require('../../index');
const rsnchat = new RsnChat(client.config.imagegenapi);
const rsnfilter = new RsnFilter(client.config.imagegenapi); 

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
                    { name: 'Children Anime v1.0', value: 'childrensStories_v1ToonAnime.safetensors [2ec7b88b]' },
                    { name: 'Dreamlike Diffusion v1.0', value: 'dreamlike-diffusion-1.0.safetensors [5c9fd6e0]' },
                    { name: 'Dreamlike Photoreal v2.0', value: 'dreamlike-photoreal-2.0.safetensors [fdcf65e7]' },
                    { name: 'Dreamshaper', value: 'dreamshaper_6BakedVae.safetensors [114c8abb]' }
                )
        ),

    async execute(interaction, client) {
        await interaction.deferReply(); 

        const prompt = interaction.options.getString('prompt');
        const selectedModel = interaction.options.getString('model');
        const negative_prompt = "blurry, bad quality"; 

        try {
            const imageResponse = await rsnchat.prodia(prompt, negative_prompt, selectedModel); 
            
            if (imageResponse.imageUrl) {
               
                const filterResponse = await rsnfilter.filter(imageResponse.imageUrl);
                
                if (filterResponse.result) {
                    await interaction.editReply({ content: 'NSFW content detected. Image generation blocked.' });
                } else {
                    const embed = new EmbedBuilder()
                        .setImage(imageResponse.imageUrl);
                    await interaction.editReply({ embeds: [embed] });
                }
            } else {
                await interaction.editReply({ content: 'Image generation failed. Please try again or check your API credentials.' });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred during image generation. Please try again later.' });
        }
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */