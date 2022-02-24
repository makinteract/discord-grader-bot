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
