const Snooper = require("reddit-snooper");
const hookcord = require("hookcord");
const config = require("./config.json");

const app_id = process.env.POE_TO_DISCORD_ID;
const api_secret = process.env.POE_TO_DISCORD_SECRET;
const subreddit = "pathofexile";
const REDDIT_URL = "https://www.reddit.com";

const { author, webhooks } = config;
const snooper = new Snooper({
  app_id,
  api_secret,

  automatic_retries: true,
  api_requests_per_minuite: 60
});

console.log(
  "Watching the subreddit ",
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

      webhooks.forEach(url =>
        new hookcord.Hook()
          .setLink(url.url)
          .setPayload(discordMessage)
          .fire()
          .then(function(response) {
            console.log("response", response);
          })
          .catch(function(e) {})
      );
    }
  })
  .on("error", console.error);

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
