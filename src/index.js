const Snooper = require("reddit-snooper");
const hookcord = require("hookcord");
const config = require("./config.json");

const REDDIT_URL = "https://www.reddit.com";

const {
  credentials: { clientId: app_id, clientSecret: api_secret },
  data: { subreddits }
} = config;
const snooper = new Snooper({
  app_id,
  api_secret,

  automatic_retries: true,
  api_requests_per_minuite: 30
});

subreddits.forEach(({ subreddit, monitor: { authors, webhooks } }) => {
  console.log(
    "Watching the subreddit",
    subreddit,
    "with the applicaiton Id:",
    app_id,
    "secret:",
    api_secret
  );

  snooper.watcher
    .getPostWatcher(subreddit)
    .on("post", function(post) {
      if (
        authors
          .map(author => author.toLowerCase())
          .includes(post.data.author.toLowerCase())
      ) {
        console.log("Post was posted by: " + post.data.author);
        const {
          data: { author, title, url, permalink, thumbnail }
        } = post;

        const discordMessage = {
          content: `${REDDIT_URL}${permalink}`,
          embeds: [
            {
              author: {
                name: author
              },
              title,
              url: `${REDDIT_URL}${permalink}`,
              thumbnail: validURL(thumbnail)
                ? {
                    url: thumbnail
                  }
                : undefined,
              fields: [{ name: "Content:", value: url }]
            }
          ]
        };

        webhooks.forEach(webhook =>
          new hookcord.Hook()
            .setLink(webhook.url)
            .setPayload(discordMessage)
            .fire()
            .then(function(response) {
              console.log("response valid!");
            })
            .catch(function(e) {})
        );
      }
    })
    .on("error", console.error);
});

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}
