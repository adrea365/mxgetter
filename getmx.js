const express = require('express');
//const cors = require('cors');
const dns = require('dns');
const { promisify } = require('util');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
//app.use(cors());

const resolveMx = promisify(dns.resolveMx);

async function getHighestPriorityMxRecord(domain) {
  try {
    const mxRecords = await resolveMx(domain);
    
    if (mxRecords.length === 0) {
      return null;
    }

    // Sort the MX records by priority (lowest number is highest priority)
    mxRecords.sort((a, b) => a.priority - b.priority);

    // Return the highest priority (lowest number) MX record
    return mxRecords[0];
  } catch (error) {
    console.error(`Error resolving MX records for ${domain}:`, error);
    return null;
  }
}

app.get('/mx', async (req, res) => {
  const domain = req.query.domain;
  
  if (!domain) {
    return res.status(400).send('Please provide a domain in the query parameter. Example: /mx?domain=example.com');
  }

  const result = await getHighestPriorityMxRecord(domain);
  
  if (result) {
    res.send(`Highest priority MX record for ${domain}: Priority ${result.priority}, Exchange ${result.exchange}`);
  } else {
    res.status(404).send(`No MX records found or an error occurred for ${domain}.`);
  }
});

app.listen(port, () => {
  console.log(`MX Record Checker API listening at http://localhost:${port}`);
});
