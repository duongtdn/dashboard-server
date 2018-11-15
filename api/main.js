"use strict"

const api = require('express-api-binder')

api.__helper = {}

api.helper = function(options) {
  for (let prop in options) {
    api.__helper[prop] = options[prop]
  }
}

const funcs = [
  'get/billing',
  'post/activate'
]

funcs.forEach(func => {
  const { method, uri, includePath } = api.parseApi(func);
  api.createFunction(method, uri, require(`./${includePath}`),  api.__helper)
})

module.exports = api;