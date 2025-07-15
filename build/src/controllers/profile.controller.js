"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserProfile = void 0;
const profileService = __importStar(require("../services/profile.service"));
const updateUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: '인증 정보가 없습니다.' });
        return;
    }
    const { nickname, birthday, gender, customSkill, customInterest, customPosition, experienceYears, employmentStatus, imageUrl, summary, userSkills, desirePositions, } = req.body;
    const safeUserSkills = Array.isArray(userSkills) ? userSkills : [];
    const safeDesirePositions = Array.isArray(desirePositions) ? desirePositions : [];
    try {
        const profile = yield profileService.updateUserProfile(userId, {
            nickname,
            birthday,
            gender,
            customSkill,
            customInterest,
            customPosition,
            experienceYears,
            employmentStatus,
            imageUrl,
            summary,
        }, safeUserSkills, safeDesirePositions);
        res.status(200).json({ message: '프로필 업데이트 성공', profile });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserProfile = updateUserProfile;
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: '인증 정보가 없습니다.' });
        return;
    }
    try {
        const profile = yield profileService.getUserProfile(userId);
        if (!profile) {
            res.status(404).json({ message: '추가 프로필 정보가 존재하지 않습니다.' });
            return;
        }
        res.status(200).json({ profile });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfile = getUserProfile;
