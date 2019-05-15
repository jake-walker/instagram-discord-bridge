// instagram.js is responsible for managing messages to and from
// Instagram.

// Import Instagram API
const apiClient = require('instagram-private-api').IgApiClient;
const config = require("./config");
const lastUpdate = require("./lastupdate");

// Create a new Instagram API instance
const api = new apiClient();

// Simple log function which adds a prefix for easy identification
// of the part of the program sending the log message.
function log(msg) {
  console.log(`I> ${msg}`);
}

// Setup function (runs once at start) with a function to run when
// a message is received.
module.exports.setup = async (msgReceived) => {
  log("Setting up Instagram...");
  // Create a 'virtual' device for running Instagram.
  api.state.generateDevice(config.instagram.username);
  // Login with the username and password from config file, wait until done.
  await api.account.login(config.instagram.username, config.instagram.password);

  // Function to run every second to check for new messages.
  return setInterval(async () => {
    // Get *all* chat threads from Instagram
    var threads = await getThreads();
    // Filter through messages in the threads, checking for new ones.
    handleMessages(threads, msgReceived);
  }, 1000);
}

// Temporary function to get the thread ids for all the different
// chats available to the account.
module.exports.threadNames = async () => {
  // Get *all* chat threads from Instagram
  const threads = await getThreads();
  let output = [];
  // For each of the threads
  await threads.forEach((thread) => {
    // Add the thread's id and name to the output
    output.push({
      id: thread.thread_id,
      name: thread.thread_title
    });
  });
  return output;
}

// Function to send a message to specific thread(s)
module.exports.send = (name, content, targetThreads) => {
  log("Forwarding message to Instagram...");
  // For each of the threads that we need to send to
  targetThreads.forEach((th) => {
    log("Sending standard message...");
    // Get the individual thread
    var thread = api.entity.directThread(th);
    // If the thread doesn't exist, skip
    if (!thread) { return; }
    // Send the message to the thread
    thread.broadcastText(`[${name}]: ${content}`);
    log("Sent!");
  });
}

// Function to get all of the chat threads
async function getThreads() {
  // Get direct message inbox.
  const inbox = api.feed.directInbox();
  // Get all of the threads in the inbox.
  const threads = await inbox.items();
  return threads;
}

// Function to filter through messages
async function handleMessages(threads, callback) {
  // Get the last time we ran this function (to ensure we don't)
  // send messages twice
  const lastTimestamp = await lastUpdate.get();

  // For each 'mapping' defined in the config
  config.mappings.forEach((mapping) => {
    // Get the discord channel(s) that we are sending to
    let discordChannels = mapping.discord;
    // For each of the instagram threads in the 'map'
    mapping.instagram.forEach((threadId) => {
      // Find the thread in the list of threads
      var thread = threads.find((t) => t.thread_id == threadId);
      // If there isn't a thread, skip
      if (!thread) { return; }
      // Get the messages in the thread, reverse the order
      // and then only get messages that are sent AFTER the last
      // time we checked AND that aren't sent by us.
      var messages = thread.items.reverse().filter((msg) => (parseInt(msg.timestamp) > lastTimestamp) && (msg.user_id != config.instagram.userid));
      
      // If we don't have any messages to process, skip.
      if (messages.length <= 0) { return; }

      // For each of the messages that we need to process.
      messages.forEach(async (msg) => {
        // Get the user's profile information
        var user = await api.user.info(msg.user_id);
        // Get the user's name, if they don't have a full name set
        // on their account, get their username.
        var name = user.full_name || user.username;
        // Get the user's avatar URL (used as profile picture in Discord)
        var avatar = user.profile_pic_url;
        // Get the type of message.
        var type = msg.item_type;
        // Set the default message content
        var content = "*[ Unsupported Message Type! ]*";
        
        switch (type) {
          // If we have a TEXT message
          case "text":
            // The content of the message is just the text of the message
            var content = msg.text;
            break;
          default:
            // If we have any other type (e.g image) we don't know what to
            // do, but print to the log so we can look later.
            console.warn(`UNSUPPORTED MESSAGE TYPE '${type}'`, msg, user);
        }

        // Now that we have a message, send them to discord.
        callback(name, avatar, content, discordChannels);
      });

      // Now that we have processed all the messages, set the last
      // time we checked for messages to be the time the LAST message
      // was sent in the chat.
      var newTimestamp = parseInt(messages[messages.length - 1].timestamp);
      lastUpdate.set(newTimestamp);
    });
  });
}