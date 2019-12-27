# Instagram Discord Bridge

<a href="https://ci.jakewalker.xyz/jake-walker/instagram-discord-bridge"><img alt="Drone Build" src="https://img.shields.io/drone/build/jake-walker/instagram-discord-bridge/master?server=https%3A%2F%2Fci.jakewalker.xyz&style=flat-square"></a>

This is a bot written in Node.js which takes messages from Instagram chats and forwards them to Discord and vice-versa.

> ⚠️ **This bot is very janky at the moment.** The code is definitely not written in the best way (like checking messages from Instagram). Check the [known problems](#known-problems) section for more info.

I am using this on a school Discord server, where people might not want to use Discord but can still join in from a linked Instagram chat (as Instagram is quite a popular chat method for people of my age).

## Known Problems

* Using this bot *could* result in your Instagram account being banned (as bots aren't really allowed by Instagram). To minimize the risk, use a fresh Instagram account that you don't care about.
* Using this bot *could* also result in your IP address being banned (as bots aren't really allowed by Instagram).
* This bot may mysteriously crash or disconnect. I have successfully ran this bot for about 4 days before I needed to restart it as the connection to Instagram broke (maybe logged out?).
* Code isn't written super efficiently, the bot may slow down significantly when processing lots of messages at the same time (from lots of different channels and threads).
* Instagram messages that aren't text based will not be sent through (e.g posts, GIFs, images, etc..).

## Setup

### Installing

_**Note:** Substitute `yarn` for `npm` if you don't have `yarn` installed._

```
git clone https://github.com/jake-walker/instagram-discord-bridge.git
cd instagram-discord-bridge
yarn install
```

### Configuring

Edit `config.js`. It has comments for describing what everything means.

**Please note:**

* The Instagram account you are using **must be a member** of any of group chats that you want to bridge.
* The Discord bot you are using **must be on channels** that you want to bridge.

#### Example Config

None of these values are real, but **do** look similar, so you should know if you are putting in the right thing or not.

```js
// This is a JavaScript object (similar to JSON) which allows comments
// to be put in.
module.exports = {
  // All the Instagram account details
  instagram: {
    // Instagram Username
    username: "discordbridge",
    // Instagram Password
    password: "Pa$$w0rd!"
  },
  // Discord Account Details
  discord: {
    // Bot Token
    token: "h80453jh8ruh9u8965wuh89w45uh9trsjlhy8tr9lhhutr89wphuy8954q3"
  },
  // Channel Mappings
  mappings: [
    {
      // The Instagram thread id goes here.
      instagram: "692164687673640789327676765486452027680",
      // The Discord channel id goes here.
      discord: "806410543778673986"
    },
    {
      // The Instagram thread id goes here.
      instagram: "690348989685685832070727853789805097762",
      // The Discord channel id goes here.
      discord: "986496785376854768"
    }
  ],
  // Webhook Mappings (optional)
  webhooks: {
    // Format: "{Discord Channel ID}": "{Discord Channel Webhook ID}/{Discord Channel Webhook Token}"
    "806410543778673986": "648567895427682768/gheuighuept859ty87459wtu85ghw8lgyh89p5eyr8g9pysh8ggyh89twy89453yt8hs"
  }
}
```

## Supported Message Types

Both Discord and Instagram have slightly different message types (for example, Instagram has normal text messages, embedded posts, etc...), this means that extra conversion is needed to send an Instagram embedded post to a Discord image. Here are the message types that I am aware of and whether they work or not.

### Instagram

| Type | Working? |
| ---- | -------- |
| **Image** (using the 'Gallery' button) | Yes |
| **Image** (using the Blue Camera button) | No (WIP) |
| **Video** (using the Blue Camera button) | No |
| **'Big' Like** (using the plus then the heart button) | Yes |
| **GIF** (using the plus then GIF button) | Yes |
| **Text** (normal message) | Yes |
| **Action** (e.g hearting a message) | Maybe _(implemented but doesn't seem to work)_ |
| **Post Embed** (going to a post then tapping the plane) | Yes |

### Discord

| Type | Working? |
| ---- | -------- |
| **Text** | Yes |