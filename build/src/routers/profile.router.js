"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const middleware_auth_1 = require("../middlewares/middleware.auth");
const router = (0, express_1.Router)();
router.get('/profile', middleware_auth_1.authMiddleware, profile_controller_1.getUserProfile);
router.patch('/profile', middleware_auth_1.authMiddleware, profile_controller_1.updateUserProfile);
exports.default = router;
