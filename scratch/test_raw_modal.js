const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'test_modal') return;

    // Try RAW Interaction Response
    try {
        await interaction.client.rest.post(`/interactions/${interaction.id}/${interaction.token}/callback`, {
            body: {
                type: 9, // MODAL
                data: {
                    title: 'Test Select Modal',
                    custom_id: 'test_modal_submit',
                    components: [
                        {
                            type: 1, // Action Row
                            components: [
                                {
                                    type: 6, // ROLE_SELECT
                                    custom_id: 'role_select',
                                    placeholder: 'Select a role',
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]
                        }
                    ]
                }
            }
        });
        console.log('RAW Modal sent successfully!');
    } catch (error) {
        console.error('RAW Modal failed:', error);
    }
});

client.login('YOUR_TOKEN_HERE');
