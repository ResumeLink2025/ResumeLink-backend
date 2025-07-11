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
const project_repository_1 = require("./repositories/project.repository");
const input = {
    userId: "a545cc89-537c-4dba-ba03-b4e2252a4bf7",
    projectName: "project 1",
    projectDesc: "desc",
    isPublic: true,
    status: "COMPLETED",
    startDate: "2025-07-01",
    endDate: "2025-07-02",
    skill: { generalSkills: ["SQLite", "Redis", "Next.js"], customSkills: ["aaa", "bbb"] },
    role: "db eng",
    tags: []
};
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const projectRepository = new project_repository_1.ProjectRepository;
        const project = yield projectRepository.findByIdDetail("368241c0-beef-49da-974d-2aa473946bbd");
        console.log(project);
    });
}
test();
