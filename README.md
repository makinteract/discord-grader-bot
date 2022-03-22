# Discord Bot

Send direct private message to students with a bot to let them know about their score.

To get started, add some data to the `data` folder. See an [example here](data/DATA.md).

Make sure also to create a `.env` file in the root folder and add your bot token. For example (an obviously fake token here...):

```
TOKEN=OTasdfasdfE2Mjkxasdfasdfw.Yhb4Cg.Hx_asdfasdfasdfasdf
```

# Notes for development

```js
// If you need to send a message
client.on('message', async (message) => {
  console.log(message);

  const TA = await client.users.fetch('some_id').catch(() => null);

  if (message.channel.type === 'DM' && message.author.id !== 'some_id') {
    message.reply({
      content: `Please directly contact the TA <@${TA?.id}> for questions`,
    });
  }
});
```
