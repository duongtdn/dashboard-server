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
    const resolvedComment = invoice.resolvedComment;

    const promises = [];

    promises.push( _resolveInvoice(db, {updatedBy, number, resolvedComment}) )

    courses.forEach(course => promises.push( _activateEnrollment(db, {uid, courseId: course.courseId, activatedBy: updatedBy})) )

    Promise.all(promises)
      .then( values => next() )
      .catch( error => res.status(400).send() )

    
  }
}

function sendEmail(db, helper) {
  return function(req, res, next) {
    if (helper && helper.sendEmail) {
      const invoice = req.body.invoice;
      const recipient = invoice.billTo.email;
      const courses = invoice.courses; 
      const customer = 'Valued Customer'
      helper.sendEmail({recipient, courses, customer}, err => {
        next()
      })
    } else {
      next()
    }
  }
}

function final() {
  return function(req, res) {
    res.status(200).json({status: 'updated'})
  }
}



function _activateEnrollment(db, {uid, courseId, activatedBy}) {
  return new Promise((resolve, reject) => {
    db.enroll.setStatus(
      {uid, courseId, activatedBy, status: 'active'},
      (err, data) => {
        if (err) {
          reject();
        } else {
          resolve(data);
        }
      })
  })
}

function _resolveInvoice(db, {updatedBy, number, resolvedComment}) {
  return new Promise((resolve, reject) => {
    db.invoice.resolve(
      {updatedBy, number, resolvedComment, status: 'paid'},
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

module.exports = [authen, activate, sendEmail, final]