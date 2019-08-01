// discord.js is responsible for managing messages to and from
// Discord.

// Import the Discord library
const Discord = require("discord.js");
const tinyurl = require("tinyurl");
// Create a new client
const client = new Discord.Client();
const config = require("./config");

// Simple log function which adds a prefix for easy identification
// of the part of the program sending the log message.
function log(msg) {
  console.log(`D> ${msg}`);
}

// Global variable for storing the callback for use in any of the
// functions.
let callback = null;

// Setup function (runs once at start) with a function to run when
// a message is received.
module.exports.setup = async (msgSent) => {
  log("Setting up Discord...");
  // Login with the token contained in the config. This will
  // automatically start the bot listening for messages.
  client.login(config.discord.token);
  // Keep a copy of the callback in the callback variable.
  callback = msgSent;
}

// Function to send a message to specific channel
module.exports.send = (name="", avatar="", content, targetChannel) => {
  log("Forwarding message to Discord...");

  // Check if we have a webhook available to use from
  // the config (this is preferred).
  if (config.webhooks.hasOwnProperty(targetChannel) && (name !== "" && avatar !== "")) {
    log("Sending webhook message...");
    // Split the webhook info up into the ID and token.
    const hookInfo = config.webhooks[targetChannel].split("/");

    // If we have more/less than we are expecting, skip.
    if (hookInfo.length !== 2) { return; }

    // Create a new webhook client for interacting with the webhook.
    const hook = new Discord.WebhookClient(hookInfo[0], hookInfo[1]);
    // Send the message content along with the Instagram user's username
    // and avatar (as a URL).
    hook.send(content, {
      username: name,
      avatarURL: avatar
    });
  } else {
    // If we don't have a webhook available, send as a standard message.
    log("Sending standard message...");
    // Find the channel that we need to send to.
    const channel = client.channels.find((c) => c.id === targetChannel);

    // If we couldn't find the channel, skip.
    if (!channel) { return; }

    // Send a message to the channel with a bold username and
    // the content.
    if (name !== "") {
      channel.send(`**[${name}]** ${content}`);
    } else {
      channel.send(content);
    }
  }

  log("Sent!");
}

// This function runs when the bot logged in and is ready
// to go.
client.on("ready", () => {
  log(`Logged in as ${client.user.tag}!`);
});

// This function runs whenever the bot receives any message from
// a Discord channel.
client.on("message", async (msg) => {
  // Get a 'mapping' from the config corresponding to the channel that the message
  // is being sent from.
  const mapping = config.mappings.find((m) => m.discord === msg.channel.id);

  // If we couldn't find a 'mapping' (i.e this channel isn't setup in the config),
  // OR the message is sent by us OR the message was sent by a bot (which could be
  // also one of our messages if we used a webhook), then IGNORE the message (skip).
  if (!mapping || msg.author.id === client.user.id || msg.author.bot) { return; }
  
  const formatted = await formatMessage(msg);

  // Get the name of the user that sent the message
  let name = msg.author.username;

  // If the bot is in a Discord server, then we can get the *member* that sent the
  // message
  if (msg.member) {
    // Take the user's *nickname* from the server that the message was sent from.
    name = msg.member.nickname || name;
  }

  // Send the message information over to be sent on Instagram as a message.
  callback(name, formatted, mapping.instagram, mapping.discord);
});

async function formatMessage(msg) {
  let output = "";

  output += msg.cleanContent;

  for (const [key, value] of msg.attachments.entries()) {
    const shorten = await tinyurl.shorten(value.url);
    output += ` ${shorten}`;
  }

  return output.trim();
}