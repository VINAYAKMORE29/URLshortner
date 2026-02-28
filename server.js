import express from 'express';
import cors from 'cors';
import {nanoid} from 'nanoid';
import pool  from './db.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());


const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('URL Shortener API is running 🚀');
});
app.post('/shorten', async (req, res) => {
    try{
      console.log(req.body);
const { originalUrl } = req.body;

if (!originalUrl) {
  return res.status(400).json({ error: 'originalUrl is required' });
}

const shortcode  = nanoid(6);

await pool.query('INSERT INTO urls (original_url, shortcode) VALUES ($1,$2)',
[originalUrl, shortcode]);

res.json({
    short_url: `http://localhost:${port}/${shortcode}`
});
}
 catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }});

app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const result = await pool.query(
      'SELECT * FROM urls WHERE shortcode = $1',
      [shortcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('URL not found');
    }

    await pool.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE shortcode = $1',
      [shortcode]
    );

    res.redirect(result.rows[0].original_url);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});