"use strict"

const { verifyToken } = require('@stormgle/jtoken-util')

const secret = process.env.AUTH_KEY_ADMIN;

function authen() {
  return verifyToken(secret);
}

function activate(db) {
  return function(req, res) {
    const updatedBy = req.user.uid;

    const invoice = req.body.invoice;
    const number = invoice.number;
    const uid = invoice.billTo.uid;
    const courses = invoice.courses; 
    const comment = invoice.comment;

    const promises = [];

    promises.push( _resolveInvoice(db, {updatedBy, number, comment}) )

    courses.forEach(courseId => promises.push( _activateEnrollment(db, {uid, courseId, updatedBy})) )

    Promise.all(promises)
      .then( values => res.status(200).json({status: 'updated'}) )
      .catch( error => res.status(400).send() )

    
  }
}

function _activateEnrollment(db, {uid, courseId, updatedBy}) {
  return new Promise((resolve, reject) => {
    db.enroll.setStatus(
      {uid, courseId, updatedBy, status: 'active'},
      (err, data) => {
        if (err) {
          reject();
        } else {
          resolve(data);
        }
      })
  })
}

function _resolveInvoice(db, {updatedBy, number, comment}) {
  return new Promise((resolve, reject) => {
    db.invoice.resolve(
      {updatedBy, number, comment, status: 'paid'},
      (err, data) => {
        if (err) {
          console.log(err)
          reject();
        } else {
          resolve(data);
        }
      })
  })
}

module.exports = [authen, activate]