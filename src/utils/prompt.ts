import { ResumeRequestBody } from "../../types/resume";

export function buildNarrativeJsonPrompt(data: ResumeRequestBody): string {
  const { basicInfo, categories, skills, projects, activities, certificates } = data;

  return `
너는 신입 또는 주니어 개발자를 위한 이력서를 작성하는 전문가야.

아래 사용자의 입력 데이터를 기반으로, 이력서 내용을 각 항목별로 자연스럽고 전문적인 문장으로 구성해서 JSON 형태로 반환해줘. 설명이나 마크다운 없이 **JSON 객체만 출력**해.

각 항목의 내용은 실제 이력서처럼 문장으로 작성해. 예를 들어 프로젝트나 활동 내용은 단순 나열이 아니라 어떤 역할을 했는지, 어떤 기술을 썼는지, 어떤 성과를 냈는지를 포함해서 작성해줘.

출력 스키마:
{
  "name": string,
  "email": string,
  "summary": string,
  "description": string,
  "categories": string[],
  "skills": string[],
  "projects": [{ "title": string, "description": string }],
  "activities": [{ "title": string, "startDate": string, "endDate": string, "description": string }],
  "certificates": [{ "name": string, "issueDate": string, "score": string, "organization": string }]
}

입력:
- 이름: ${basicInfo.name}
- 이메일: ${basicInfo.email}
- 한줄 요약: ${basicInfo.summary}
- 자기소개: ${basicInfo.description}

- 개발자 카테고리: ${categories.join(", ")}
- 기술 스택: ${skills.join(", ")}

- 프로젝트:
${projects.map(p => `  • ${p.title}: ${p.description}`).join("\n")}

- 활동:
${activities.map(a => `  • ${a.title} (${a.startDate} ~ ${a.endDate}): ${a.description}`).join("\n")}

- 자격증:
${certificates.map(c => `  • ${c.name} (${c.issueDate}, 점수: ${c.score}, 발급기관: ${c.organization})`).join("\n")}

※ 반드시 위의 JSON 스키마 형식을 지켜서 출력하고, 다른 텍스트나 설명은 포함하지 마세요.
  `;
}
