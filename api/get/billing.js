"use strict"

// NOT TESTED YET

const { verifyToken } = require('@stormgle/jtoken-util')

const secret = process.env.AUTH_KEY_ADMIN;

function authen() {
  return verifyToken(secret);
}

function queryInvoices(db) {
  return function(req, res, next) {
    db.invoice.queryInvoicesByStatus({status: 'billing'}, (err, data) => {
      req.invoices = data;
      next();
    })
  }
}

function final() {
  return function(req, res) {
    res.status(200).json({data : req.invoices })
  }
}

module.exports = [authen, queryInvoices, final]