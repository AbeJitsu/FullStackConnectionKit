// server/api/cors-test.js
module.exports = (req, res) => {
  res.status(200).json({ message: 'CORS test successful' });
};
