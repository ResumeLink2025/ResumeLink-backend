import { ResumeRequestBody } from "../../types/resume";

export function buildNarrativeJsonPrompt(data: ResumeRequestBody & {
  name: string;
  position: string;      // 쉼표로 이어진 포지션 리스트
  skills: string[];      // 기술 스택 배열
  summary: string;
}) {
  const {
    name,
    position,
    summary,
    experienceNote = "",
    categories,
    skills,
    projects,
    activities = [],
    certificates = [],
  } = data;

  return `
너는 신입 또는 주니어 개발자를 위한 이력서를 작성하는 전문가야.

아래 사용자의 입력 데이터를 기반으로, 이력서 내용을 각 항목별로 자연스럽고 전문적인 문장으로 구성해서 JSON 형태로 반환해줘. 설명이나 마크다운 없이 **JSON 객체만 출력**해.
또한, **개발자 카테고리**의 단어들이 강조되게 전체 이력서를 수정해줘.
특히, 아래의 **개발 관련 경험 텍스트**는 자유 형식으로 입력된 내용이야. 이 내용을 보고 너의 판단 하에 가장 적절하게 다음 항목들로 **적절히 나눠서 배치해줘**:
날짜 필드는 모두 ISO 8601 형식(예: 2024-03-15 또는 2024-03)으로 작성하세요.

- summary (자기소개)
- projects
- activities
- certificates

출력할 때는 experienceNote는 포함하지 마.  
최종 JSON 결과에는 아래 형식만 포함해줘:

출력 스키마:
{
  "name": string,
  "position": string[],
  "summary": string,
  "description": string,
  "categories": string[],
  "skills": string[],
  "projects": [{ "title": string, "description": string }],
  "activities": [{ "title": string, "startDate": string, "endDate": string, "description": string }],
  "certificates": [{ "name": string, "issueDate": string, "score": string, "organization": string }]
}

입력 정보:
- 이름: ${name}
- 희망 직무: ${position}
- 한줄 요약: ${summary}

- 개발자 카테고리: ${categories.join(", ")}
- 기술 스택: ${skills.join(", ")}

- 자유 입력 개발 경험:
${experienceNote}

- 프로젝트:
${projects.map(p => `  • ${p.name}: ${p.description}`).join("\n")}

- 활동:
${activities.map(a => `  • ${a.title} (${a.startDate} ~ ${a.endDate}): ${a.description ?? ""}`).join("\n")}

- 자격증:
${certificates.map(c => `  • ${c.name} (${c.date}, 점수: ${c.grade}, 발급기관: ${c.issuer})`).join("\n")}

※ 반드시 위의 JSON 스키마 형식만 지켜서 출력하고, 다른 텍스트나 설명은 포함하지 마세요.
`;
}
