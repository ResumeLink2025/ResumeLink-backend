import { ProjectRepository } from './repositories/project.repository';
import { ProjectStatus } from '@prisma/client';

const input = {
    userId: "a545cc89-537c-4dba-ba03-b4e2252a4bf7",
    projectName: "project 1",
    projectDesc: "desc",
    isPublic: true,
    status: "COMPLETED" as ProjectStatus,
    startDate: "2025-07-01" ,
    endDate: "2025-07-02",
    skill: {generalSkills: ["SQLite", "Redis", "Next.js"], customSkills: ["aaa", "bbb"]},
    role: "db eng",
    tags: []


}
async function test() {
    const projectRepository = new ProjectRepository
    const project = await projectRepository.findByIdDetail("368241c0-beef-49da-974d-2aa473946bbd")
    console.log(project)
}


test()