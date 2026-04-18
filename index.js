import "dotenv/config";
import {
    Client,
    GatewayIntentBits,
    Partials,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder
} from "discord.js";


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ]
});

// Categorieën
const CATEGORY_DEV = "1494276457269166080";
const CATEGORY_SUPPORT = "1493666289284153455";
const CATEGORY_BEHEER = "1493666021914050751";
const CATEGORY_PARTNER = "1493666156219732038";

// Staff role
const STAFF_ROLE_ID = "1492193050863341692";

client.on("ready", () => {
    console.log(`Bot is online als ${client.user.tag}`);
});

// ----------------------
// /ticket command
// ----------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "ticket") return;

    const embed = new EmbedBuilder()
        .setTitle("🎟️ Ticketsysteem")
        .setDescription(
            "**Welkom bij Drenthe Ticket Support**\n\n" +
            "**Wat gebeurt er bij het openen van een ticket?**\n" +
            "• U wordt automatisch getagd\n" +
            "• Ons support team wordt direct ingeschakeld\n" +
            "• Uw ticket komt in de juiste categorie terecht\n" +
            "• Alles wordt netjes gelogd voor overzicht en veiligheid\n\n" +
            "**Dutch Drenthe RP | ER:LC**"
        )
        .setColor(0x00aaff);

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Selecteer een categorie")
            .addOptions([
                { label: "Partnership support", value: "partner" },
                { label: "Normale support", value: "support" },
                { label: "Beheer-support", value: "beheer" },
                { label: "DEV sollicitatie", value: "dev" }
            ])
    );

    await interaction.reply({ content: "Ticket geopend!", ephemeral: true });
});


// ----------------------
// Dropdown handler
// ----------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_menu") return;

    const keuze = interaction.values[0];
    const guild = interaction.guild;

    let categoryId;
    let titel;

    switch (keuze) {
        case "partner": categoryId = CATEGORY_PARTNER; titel = "🤝 Partnership ticket"; break;
        case "support": categoryId = CATEGORY_SUPPORT; titel = "🆘 Support ticket"; break;
        case "beheer": categoryId = CATEGORY_BEHEER; titel = "🛠️ Beheer-support ticket"; break;
        case "dev": categoryId = CATEGORY_DEV; titel = "💼 DV sollicitatie"; break;
    }

    // Ticketkanaal aanmaken
    const channel = await guild.channels.create({
        name: `ticket-${keuze}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]},
            { id: STAFF_ROLE_ID, allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]}
        ]
    });

    // Embed in ticket
    const ticketEmbed = new EmbedBuilder()
        .setTitle(titel)
        .setDescription(`Welkom <@${interaction.user.id}>! Leg hier uw vraag of verzoek uit.`)
        .setColor(0x00aaff);

    // Sluitknop
    const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Ticket sluiten")
            .setStyle(ButtonStyle.Danger)
    );

    // Bericht in ticketkanaal
    await channel.send({
        content: `🎟️ Ticket geopend door <@${interaction.user.id}>`,
        embeds: [ticketEmbed],
        components: [closeRow]
    });

    // Antwoord op dropdown
    await interaction.reply({ content: `Uw ticket is geopend: ${channel}`, ephemeral: true });
});


// ----------------------
// Close button handler + transcript
// ----------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "close_ticket") return;

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;

    // Berichten ophalen
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    let transcript = `Transcript van ticket: ${channel.name}\n\n`;

    sorted.forEach(msg => {
        transcript += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
    });

    const buffer = Buffer.from(transcript, "utf-8");

    try {
        await interaction.user.send({
            content: "Bedankt voor het contacteren van Drenthe RP! Hier is uw transcript.",
            files: [{ attachment: buffer, name: `transcript-${channel.name}.txt` }]
        });
    } catch (err) {
        console.log("Kon geen DM sturen:", err);
    }

    await interaction.editReply({ content: "Ticket wordt gesloten..." });

    setTimeout(() => {
        channel.delete().catch(() => {});
    }, 2000);
});
// ----------------------
// /ssu command
// ----------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "ssu") return;

    const embed = new EmbedBuilder()
        .setTitle("🚨 SSU Gestart!")
        .setDescription(
            `**${interaction.user} heeft een SSU gestart!**\n\n` +
            "Roleplay requests worden nu geaccepteerd.\n" +
            "De beste roleplays vinden nu plaats in de server.\n\n" +
            "Kom jij een kijkje nemen?"
        )
        .setColor(0xff0000)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
});


// LOGIN
import "dotenv/config";
client.login(process.env.TOKEN);


// ----------------------
// /ssu command
// ----------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "ssu") return;

    const embed = new EmbedBuilder()
        .setTitle("🚨 SSU Gestart!")
        .setDescription(
            `**${interaction.user} heeft een SSU gestart!**\n\n` +
            "Roleplay requests worden nu geaccepteerd.\n" +
            "De beste roleplays vinden nu plaats in de server.\n\n" +
            "Kom jij een kijkje nemen?"
        )
        .setColor(0xff0000)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
});

client.on("guildMemberAdd", async member => {
    const channel = member.guild.channels.cache.get("1492193051161006251"); // <-- Vul je welkom kanaal ID in

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("🛬 | Welcome!")
        .setImage("https://images-ext-1.discordapp.net/external/ea_0YM0y1ZQb10Hk__0MUNj7LJcgjcI9V5mKXFaRhhQ/https/scnx-cdn.scootkit.net/1775984020407-guild-yaL1qY2OVGLIT3vox2X7uum4fNayMVltrsRU1yPaBRScsKD1.png?format=webp&quality=lossless&width=1604&height=902")
        .setDescription(
            `Welcome ${member} to **Dutch Drenthe Roleplay I ER:LC**!\n\n` +
            `Thanks for joining our Community.\n` +
            `Dutch Drenthe Roleplay is a realistic Roleplay server based on The Netherlands.\n\n` +
            `Also don't forget to read all our **<#1492193051349745738>** and **<#1492193051349745739>**.\n` +
            `And don't forget to claim your **<#1492193051349745737>**! They are made for you!\n\n` +
            `We now have **${member.guild.memberCount} Members!!**`
        )
        .setColor("#00AEEF")
        .setTimestamp();

    channel.send({ embeds: [embed] });
});