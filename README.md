# Instagram Discord Bridge

This is a bot written in Node.js which takes messages from Instagram chats and forwards them to Discord and vice-versa.

> ⚠️ **This bot is very janky at the moment.** The code is definitely not written in the best way (like checking messages from Instagram). Check the [known problems](#known-problems) section for more info.

I am using this on a school Discord server, where people might not want to use Discord but can still join in from a linked
Instagram chat.

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
    password: "Pa$$w0rd!",
    // Instagram User ID (prevents sending own messages)
    userid: "6896547667"
  },
  // Discord Account Details
  discord: {
    // Bot Token
    token: "h80453jh8ruh9u8965wuh89w45uh9trsjlhy8tr9lhhutr89wphuy8954q3"
  },
  // Channel Mappings
  mappings: [
    // Example mapping of 1 Instagram chat to 1 Discord channel.
    {
      // A list of Instagram **thread ids** go in here (min 1).
      instagram: [
        "692164687673640789327676765486452027680"
      ],
      // A list of Discord **channel ids** go in here (min 1).
      discord: [
        "806410543778673986"
      ]
    },
    // Example mapping of 2 Instagram chats to 1 Discord channel.
    {
      // A list of Instagram **thread ids** go in here (min 1).
      instagram: [
        "690348989685685832070727853789805097762",
        "689548667842765476547826854268754768505"
      ],
      // A list of Discord **channel ids** go in here (min 1).
      discord: [
        "986496785376854768"
      ]
    },
    // Example mapping of 1 Instagram chats to 2 Discord channel.
    {
      // A list of Instagram **thread ids** go in here (min 1).
      instagram: [
        "984069858695468745768406784086708970457"
      ],
      // A list of Discord **channel ids** go in here (min 1).
      discord: [
        "638687456745867584",
        "834698376078965478"
      ]
    },
    {
      // A list of Instagram **thread ids** go in here (min 1).
      instagram: [
        "784567467854768762367549675476808647464",
        "685496854764789678476458768540768407840",
        "375685476547685478426543765479567493679",
        "457897659786597856937886240567854307680"
      ],
      // A list of Discord **channel ids** go in here (min 1).
      discord: [
        "665468784789067896",
        "678475860267845037"
      ]
    }
  ],
  // Webhook Mappings (optional)
  webhooks: {
    // Format: "{Discord Channel ID}": "{Discord Channel Webhook ID}/{Discord Channel Webhook Token}"
    "806410543778673986": "648567895427682768/gheuighuept859ty87459wtu85ghw8lgyh89p5eyr8g9pysh8ggyh89twy89453yt8hs",
    "678475860267845037": "648567895427682768/gheuighuept859ty87459wtu85ghw8lgyh89p5eyr8g9pysh8ggyh89twy89453yt8hs"
  }
}
```