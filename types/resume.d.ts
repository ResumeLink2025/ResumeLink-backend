export interface AiProjectInfo {
  id: string; // 프로젝트 ID (UUID)
  projectName: string;
  projectDesc?: string;
  startDate: string;
  endDate?: string | null;
  role: string;
  generalSkills: string[];
  customSkills: string[];
}

export interface ResumeRequestBody {
  title: string;            // 이력서 제목
  summary?: string;         // UserProfile에서 불러오되 편집 가능
  experienceNote?: string;  // 개발 관련 자유기술
  isPublic?: boolean;       // 공개 여부 (기본값 false)
  theme?: "light" | "dark"; // 이력서 테마 선택

  categories: string[];     // 개발자 성향 키워드 (Category 테이블 참조)
  skills: string[];         // 기술 스택 이름들 (UserSkill + customSkill 포함)
  positions: string[];      // 직군 이름들 (DesirePosition + customPosition 포함)

  projects: AiProjectInfo[]; // 프로젝트 정보 배열

  activities?: {
    title: string;
    startDate: string;       // "YYYY-MM-DD" 형식 권장
    endDate?: string;
    description?: string;
  }[];

  certificates?: {
    name: string;
    date?: string;           // "YYYY-MM-DD"
    grade?: string;          // 점수 or 급수
    issuer?: string;         // 발급기관
  }[];
}
