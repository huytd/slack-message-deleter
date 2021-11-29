# Slack Message Deleter

Bulk delete your messages on Slack. Using Slack's public Web API, no workspace app install needed.

## Getting Started

**Important:** Create `config.json` file from the template file:

```
mv config.json.example config.json
```

Config your workspace and channel information:

- `workspace`: Url to your workspace, for example `manga-hq.slack.com`
- `targetChannelId`: ID of the channel you want to delete your message, for example: `C1234567890`
- `currentUserId`: Your user ID, keep reading to see how to obtain it.
- `token` and `cookie`: Keep reading to see how to obtain them.

## Obtain your User ID

Click on your user name, select **View full profile**, on your profile screen, click **More** -> **Copy member ID**.

## Obtain the Token from Slack Web App

Use your browser devtool and inspect the Network tab, search for any `users/info` API call and check the **request body**.

Your Token should be something like:

```
xoxc-xxxxx...
```

## Obtain the Cookie from Slack Web App

Inspect any request and check the **request headers**, copy everything in the **Cookie** field.

## Run the delete script

Install the dependencies if you haven't:

```
npm install
```

Run the delete script **after you configured everything in `config.json`**:

```
npm run start
```

# Important notes

This script does not required you to install any app into your workspace.

If you are non-admin users, you can only delete your own messages.

Even if you are admin users, in 1:1 DMs, you can only delete your own message.
