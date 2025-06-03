"use strict";

var express = require('express');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var router = express.Router(); // Регистрация

router.post('/register', function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          res.json({
            message: 'Register route - временно отключен'
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Вход

router.post('/login', function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          res.json({
            message: 'Login route - временно отключен'
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Получение профиля пользователя

router.get('/profile', function (req, res) {
  res.json({
    message: 'Profile route - временно отключен'
  });
});
module.exports = router;
//# sourceMappingURL=auth.dev.js.map
