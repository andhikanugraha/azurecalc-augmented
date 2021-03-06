import * as express from 'express';
import * as proxy from 'http-proxy-middleware';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as bodyParser from 'body-parser';

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
  $('.section-calculator h1').text('Augmented pricing calculator (unofficial)');

  // Remove feedback because this is unofficial
  $('section.calculator-feedback').remove();
  // Remove Olark script
  $('script[data-cfasync]').remove();

  // $('script').each((idx, e) => {
  //   let elmt = $(e);
  //   let elmtText = elmt.text();
  //   if (elmtText.match(/GoogleAnalytics/i) || elmtText.match(/clicktale/i) || elmtText.match(/c\.microsoft\.com/i)) {
  //     elmt.remove();
  //   }
  // });

  const formInsert = `<form action="/exportedEstimate.json" method="POST" id="exportJsonForm">
    <input type="hidden" name="jsonBody" id="jsonBodyInput">
  </form>`;
  $('body').append(formInsert);

  const scriptInsert = `<script src="/extension.js"></script>`;
  $('body').append(scriptInsert);
  res.send($.html());
}

app.all('/', augmentedCalculator);
// app.all(/pricing\/calculator/, augmentedCalculator);

app.use('/exportedEstimate.json', bodyParser.urlencoded({ extended: true }));
app.post('/exportedEstimate.json', (req, res, next) => {
  try {
    const parsedJson = JSON.parse(req.body.jsonBody);
    res.header('Content-Disposition', 'attachment; filename="ExportedEstimate.json"');
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(parsedJson, null, 2));
  }
  catch (e) {
    res.json({error: e.toString()});
  }
});

app.use('/', express.static(__dirname + '/public'));
app.use('/', proxy({target: endpointBase, changeOrigin: true}));
app.listen(process.env.PORT || 3000, () => console.log('Express now listening'));
