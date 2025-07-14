"use strict";
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
exports.seedProjectSkills = seedProjectSkills;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function seedProjectSkills() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.projectSkill.createMany({
            data: [
                // projectId, skillId는 실제 DB에 맞게 변경 필요
                {
                    projectId: "b42617d6-b332-4068-9030-a49a72f0b98c", // ex) 실제 project.id
                    skillId: 1 // ex) 실제 skill.id
                },
                {
                    projectId: "b42617d6-b332-4068-9030-a49a72f0b98c",
                    skillId: 2
                },
                {
                    projectId: "ca647b57-b973-4163-9fb4-413e40d68936",
                    skillId: 3
                }
            ],
            skipDuplicates: true,
        });
        console.log('✅ ProjectSkill seed completed.');
    });
}
