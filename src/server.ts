import * as express from 'express';
import * as proxy from 'http-proxy-middleware';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();

const endpointBase = 'https://azure.microsoft.com';

app.use(function(req, res, next) {
    res.cookie('userInfo', '');
    next();
});

async function augmentedCalculator(req, res, next) {
  let url = req.url;
  if (!url.match('calculator')) {
    url = '/en-us/pricing/calculator';
  }

  const response = await fetch(endpointBase + url, {
    headers: {
      ...req.headers,
      host: 'azure.microsoft.com'
    }
  });

  const responseText = await response.text();

  const $ = cheerio.load(responseText);
  $('.section-calculator h1').text('Augmented pricing calculator');
  const scriptInsert = `<script src="/extension.js"></script>`;
  $('body').append(scriptInsert);
  res.send($.html());
}

app.all('/', augmentedCalculator);
app.all(/pricing\/calculator/, augmentedCalculator);

app.use('/', express.static(__dirname + '/public'));
app.use('/', proxy({target: endpointBase, changeOrigin: true}));
app.listen(process.env.PORT || 3000, () => console.log('Express now listening'));
