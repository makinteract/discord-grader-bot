# 🤖 Discord Bot

Send a direct private message to students with a bot to let them know about their scores.

![](assets/screenshot.png)

To get started, add some `participants` ([example here](examples/participants.xlsx)) and `scores` ([example here](examples/HW.xlsx)) as excel files in the `data` folder.

Your participants' data should include the following columns: `id`, `name`, and `discordID`. Here is an example:

| id   | name  | discord ID        |
| ---- | ----- | ----------------- |
| 1004 | Linda | 79217398712938712 |

Your score data should include the following columns: `id` and `score`. Example:

| id   | score |
| ---- | ----- |
| 1004 | 90    |

Optionally, you can add as many columns as you want with the score of parts of the homework.

## Before you start

Make also create a `.env` file in the root folder and add your bot token. For example (an obviously fake token here...):

```
TOKEN=OTasdfasdfE2Mjkxasdfasdfw.Yhb4Cg.Hx_asdfasdfasdfasdf
```

- Here how to setup the bot and where to get a token
  https://discord.com/developers/applications
- You then need to generate a URL (OAuth section) to invite the bot to the server
  https://www.youtube.com/watch?v=4XswiJ1iUaw
