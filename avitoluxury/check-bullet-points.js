const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection;
  const products = await db.collection('products').find({
    bulletPoints: { $exists: true, $ne: [] }
  }).limit(5).toArray();
  
  console.log(JSON.stringify(products.map(p => ({
    _id: p._id,
    name: p.name,
    bulletPoints: p.bulletPoints
  })), null, 2));
  
  mongoose.disconnect();
}).catch(err => console.error(err));