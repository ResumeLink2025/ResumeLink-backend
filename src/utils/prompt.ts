import { ResumeRequestBody, AiProjectInfo } from "../../types/resume";

export function buildNarrativeJsonPrompt(data: ResumeRequestBody & {
  name: string;
  positions: string[];
  skills: string[];
  summary: string;
  projects: AiProjectInfo[];
  activities: any[];
  certificates: any[];
  experienceNote?: string;
  categories?: string[];
}) {
  const {
    name,
    positions = [],
    summary,
    experienceNote = "",
    categories = [],
    skills = [],
    projects = [],
    activities = [],
    certificates = [],
  } = data;

  return `
너는 신입 또는 주니어 개발자를 위한 이력서 작성 전문가야.

아래 사용자의 입력 데이터를 바탕으로 각 항목을 자연스럽고 전문적인 문장으로, 개발자 카테고리의 단어들을 반영해서 JSON 형태로만 출력해줘.
출력 시 마크다운 문법(예: **굵게**)은 사용하지 말고, 순수 텍스트로 작성해줘.
날짜 필드는 모두 ISO 8601 형식으로 작성하고, projects 항목은 입력받은 projects 데이터의 projectDesc만 수정해.
추가적인 프로젝트 생성이나 임의 내용 삽입은 하지 말고, id값은 절대 변경하지 마.
출력은 JSON 객체만, 별도의 설명이나 마크다운 없이 반환해줘.
특히 자유 형식으로 입력된 개발 경험 텍스트를 보고 적절히 다음 항목에 배치해줘.

- summary (자기소개)
- projects
- activities
- certificates

출력할 때는 experienceNote는 포함하지 마.  
최종 JSON 결과에는 아래 형식만 포함해줘:

출력 스키마:
{
  "name": string,
  "positions": string[],
  "summary": string,
  "categories": string[],
  "skills": string[],
  "projects": [{ "id": string, "title": string, "description": string, "role": string, "startDate": string, "endDate": string | null, "generalSkills": string[], "customSkills": string[] }],
  "activities": [{ "title": string, "startDate": string, "endDate": string, "description": string }],
  "certificates": [{ "name": string, "date": string, "grade": string, "issuer": string }]
}

입력 정보:
- 이름: ${name}
- 희망 직무: ${positions.join(", ")}
- 한줄 요약: ${summary}

- 개발자 카테고리: ${categories.join(", ")}
- 기술 스택: ${skills.join(", ")}

- 자유 입력 개발 경험:
${experienceNote}

- 프로젝트:
${projects.map(p => `  • ${p.projectName} (${p.startDate} ~ ${p.endDate ?? "현재"}): 역할 - ${p.role}
    설명: ${p.projectDesc ?? "없음"}
    일반 스킬: ${(p.generalSkills ?? []).join(", ")}
    커스텀 스킬: ${(p.customSkills ?? []).join(", ")}
    id: ${p.id}`).join("\n")}

- 활동:
${activities.map(a => `  • ${a.title} (${a.startDate} ~ ${a.endDate}): ${a.description ?? ""}`).join("\n")}

- 자격증:
${certificates.map(c => `  • ${c.name} (${c.date}, 점수: ${c.grade}, 발급기관: ${c.issuer})`).join("\n")}

※ 반드시 위의 JSON 스키마 형식만 지켜서 출력하고, 다른 텍스트나 설명은 포함하지 마세요.
`;
}
