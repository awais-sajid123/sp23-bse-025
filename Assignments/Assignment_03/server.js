const express = require('express');
const path = require('path');

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, Images)
app.use(express.static(path.join(__dirname, 'Public')));

// Home Page Route
app.get('/', (req, res) => {
  res.render('layout', {
    //title: 'Home Page', // Page Title
    body: 'home', // Pass the name of the EJS file to include
  });
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
