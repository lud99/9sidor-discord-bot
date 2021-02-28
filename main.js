const Discord = require("discord.js");
const express = require("express");
const dotenv = require("dotenv");
const sanitizeHtml = require('sanitize-html');

dotenv.config({ path: "./config.env" });

const app = express();

// increase request size
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.post("/api/v1/post-article", (req, res) => {
    const article = req.body;

    if (article.hidden || !article.showOnStartPage)
        return res.end();

    // Start the discord bot
    const client = new Discord.Client();

    client.once("ready", () => {
        console.log("Discord bot started");

        const newsChannel = client.channels.cache.get(process.env.CHANNEL_ID);

        //makeMessage(article);

        
        newsChannel.send(makeMessage(article));

        return res.status(200).json({ success: true });
    });
    
    client.login(process.env.TOKEN);
});

app.listen(process.env.PORT || 7500, () => console.log("Server running"));

const makeMessage = (article) => {
    ;var text = article.mainText;

    // Replace br with newlines
    text = replace(text, "<br />", "\n");
    text = replace(text, "<br/>", "\n");
    text = replace(text, "<br>", "\n");
    text = replace(text, "</br>", "\n");

    // Div to newline
    text = replace(text, "</div>", "\n");
    text = replace(text, "<div>", "");

    // Sanitize
    text = sanitizeHtml(text, strictSanitizeOptions);

    var shortText = article.previewText;

    // Replace br with newlines
    shortText = replace(shortText, "<br />", "\n");
    shortText = replace(shortText, "<br/>", "\n");
    shortText = replace(shortText, "<br>", "\n");
    shortText = replace(shortText, "</br>", "\n");

    // Div to newline
    shortText = replace(shortText, "</div>", "\n");
    shortText = replace(shortText, "<div>", "");

    const url = "https://9sidor.ml/sv" + article.url;

    // Sanitize
    shortText = sanitizeHtml(shortText, strictSanitizeOptions);
    shortText += `\n[Läs mer](url)`

    const embed = new Discord.MessageEmbed()
        .setColor("#fdc700")
        .setAuthor("9sidor", "https://www.9sidor.ml/apple-touch-icon.png")
        .setURL(url)
        .setTitle(article.title)

    embed.addField("Kort text", shortText, false);
    if (text.length < 1024) embed.addField("Längre text", text, false);

    if (article.image && article.image.url)
        embed.setImage(article.image.url);

    embed.addField("Ämne", article.subject.name, false);
            
    if (article.image && article.image.text)
        embed.addField("Bildtext", article.image.text, false);

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