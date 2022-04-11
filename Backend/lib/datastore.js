const { createClient } = require("redis");
let client;
(async () => {
  console.log("here....");
  client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  client.on("connect", () =>
    console.log("Redis Client successfully connected")
  );

  await client.connect();
})();

module.exports = client;
