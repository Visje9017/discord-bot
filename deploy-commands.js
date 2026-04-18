import { REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

const commands = [
    new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Stuur het ticket paneel"),

    new SlashCommandBuilder()
        .setName("ssu")
        .setDescription("Start een SSU aankondiging")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

rest.put(
    Routes.applicationGuildCommands("149410227083511616", "1492193050846429254"),
    { body: commands }
)
.then(() => console.log("Commands geregistreerd"))
.catch(console.error);