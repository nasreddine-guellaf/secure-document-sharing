const app = require("./app");
const env = require("./config/env");
const { ensureUploadDirectory } = require("./services/storage.service");

ensureUploadDirectory();

app.listen(env.PORT, () => {
  console.log(`Secure Document Sharing API running on http://localhost:${env.PORT}`);
});
