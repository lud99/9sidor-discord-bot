const Discord = require("discord.js");
const express = require("express");
const dotenv = require("dotenv");
const sanitizeHtml = require('sanitize-html');

dotenv.config({ path: "./config.env" });

const app = express();
app.use(express.json()); 

app.post("/api/v1/post-article", (req, res) => {
    const article = req.body;

    if (article.hidden || !article.showOnStartPage)
        return res.end();

    // Start the discord bot
    const client = new Discord.Client();

    client.once("ready", () => {
        console.log("Discord bot started");

        const newsChannel = client.channels.cache.get(process.env.CHANNEL_ID);
        
        newsChannel.send(makeMessage(article));

        return res.status(200).json({ success: true });
    });
    
    client.login(process.env.TOKEN);
});

app.listen(process.env.PORT || 7500, () => console.log("Server running"));

const makeMessage = (article) => {
    var description = `${article.previewText} \n[Läs mer](${article.url})`;

    // Replace br with newlines
    description = replace(description, "<br />", "\n");
    description = replace(description, "<br/>", "\n");

    // Sanitize
    description = sanitizeHtml(description, strictSanitizeOptions);

    const url = "https://9sidor.ml" + article.url;

    const embed = new Discord.MessageEmbed()
        .setColor("#fdc700")
        .setAuthor("9sidor", "https://www.9sidor.ml/apple-touch-icon.png")
        .setURL(url)
        .setTitle(article.title)
        .setDescription(description)

    if (article.image && article.image.url)
        embed.setImage(article.image.url);

    embed.addField("Ämne", article.subject.name);
            
    if (article.image && article.image.text)
        embed.addField("Bildtext", article.image.text);

    embed.setFooter(article.displayDate);

    return embed;
}

const replace = (string, target, replace = "") => string.split(target).join(replace);

const looseSanitizeOptions = {
    allowedTags: ['b', 'i', 'u', 'br', 'div'],
    allowedAttributes: {}
}

const strictSanitizeOptions = {
    allowedTags: [],
    allowedAttributes: {}
}