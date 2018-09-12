"use strict"

require('dotenv').config()

const db = require('database-test-helper')
const enrolldb = require('enrolldb-test-helper')
const invoicedb = require('invoicedb-test-helper')

db.start().add({enrolldb, invoicedb}).init(() => {
  const app = require('./app.local')
  const PORT = process.env.API_DASHBOARD_HOST || 3200;
  const httpServer = require('http').createServer(app);
  httpServer.listen(PORT)
  console.log(`\n# Dashboard-Server is running at http://localhost:${PORT}\n`);
});