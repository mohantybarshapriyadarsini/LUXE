const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`LUXE Saler server running on port ${PORT}`);
});
