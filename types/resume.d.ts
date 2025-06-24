export interface ResumeRequestBody {
  basicInfo: {
    name: string;           // 이름
    email: string;          // 이메일
    summary: string;        // 한줄 요약
    description: string;    // 자기소개
  };
  categories: string[];     // 개발자 카테고리 (백엔드, 프론트엔드 등)
  
  skills: string[];

  projects: {
    title: string;
    description: string;
  }[];

  activities: {
    title: string;           // 활동명
    startDate: string;       // 시작일 (예: 2023.01)
    endDate: string;         // 종료일 (예: 2023.08)
    description: string;     // 상세 내용
  }[];

  certificates: {
    name: string;            // 자격증명
    issueDate: string;       // 취득 날짜
    score: string;           // 취득 점수
    organization: string;    // 발급 기관
  }[];

  template?: "기본" | "밝은 화면" | "어두운 화면"; // 선택 가능한 템플릿
}
