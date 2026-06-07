import { AnalysisResult } from "../types";

export interface SampleTestPaper {
  id: string;
  name: string;
  description: string;
  subject: string;
  thumbnail: string;
  result: AnalysisResult;
}

export const SAMPLE_DATASETS: SampleTestPaper[] = [
  {
    id: "math-midterm",
    name: "중3-1 수학 중간고사 산출",
    description: "이차방정식과 인수분해 단원 자필 시험지",
    subject: "수학",
    thumbnail: "📐",
    result: {
      subject: "수학",
      grade: "중학교 3학년 1학기",
      totalScore: 78,
      maxScore: 100,
      gradedQuestions: [
        {
          number: 1,
          isCorrect: true,
          studentAnswer: "3",
          correctAnswer: "3",
          score: 4,
          concept: "제곱근의 뜻과 성질",
          feedback: "제곱근의 양수와 음수 개념을 완벽하게 이해하고 신속하게 풀어냈습니다."
        },
        {
          number: 2,
          isCorrect: true,
          studentAnswer: "5",
          correctAnswer: "5",
          score: 4.5,
          concept: "무리수와 실수",
          feedback: "주어진 수직선 위의 점들과 무리수를 완벽히 1:1 매칭하였습니다."
        },
        {
          number: 3,
          isCorrect: false,
          studentAnswer: "1",
          correctAnswer: "4",
          score: 5,
          concept: "인수분해 공식의 활용",
          feedback: "인수분해 공식 (a-b)²을 전개하는 과정에서 중간 일차항(-2ab)의 부호 처리에 연산 실수가 감지되었습니다. 다음부터는 암산보다 전개식을 종이에 한번 직접 적어 실수를 방지하세요."
        },
        {
          number: 4,
          isCorrect: true,
          studentAnswer: "2",
          correctAnswer: "2",
          score: 5,
          concept: "이차방정식의 풀이 (인수분해)",
          feedback: "인수분해를 통해 빠르게 두 근의 해를 바르게 산출하였습니다. 훌륭합니다."
        },
        {
          number: 5,
          isCorrect: false,
          studentAnswer: "x = 3 (중근)",
          correctAnswer: "x = -3 (중근)",
          score: 5.5,
          concept: "이차방정식이 중근을 가질 조건",
          feedback: "완전제곱식을 구하는 과정까지는 논리가 아주 완벽했으나, 최종적으로 근을 구하는 도중 부호 반전 부주의(x+3=0 에서 x=-3을 구해야 함)로 실점하였습니다. 매우 아까운 문항입니다."
        },
        {
          number: 6,
          isCorrect: true,
          studentAnswer: "4",
          correctAnswer: "4",
          score: 4.5,
          concept: "대각선의 길이의 활용",
          feedback: "피타고라스 정리와 제곱근 성질을 입체도형에 깔끔하게 응용하여 완벽히 맞췄습니다."
        },
        {
          number: 7,
          isCorrect: false,
          studentAnswer: "20",
          correctAnswer: "15",
          score: 6,
          concept: "이차방정식의 근과 계수의 관계",
          feedback: "두 근의 합과 곱의 공식을 정확히 인지하지 못해 계산 오류를 범했습니다. 근과 계수의 관계공식 'α+β = -b/a', 'αβ = c/a' 암기 유도가 최우선적으로 선행되어야 합니다."
        }
      ],
      weaknessAnalysis: "전반적으로 단순 제곱근 원리나 직관적 연산 능력은 우수하나, 공식에 문자를 대입하여 복합적으로 변형하는 파트(인수분해의 활용 및 근과 계수의 관계)에서 식 전개 실수 및 기본 암기 부족이 관찰됩니다.\n특히 단순 계산을 마친 후 근의 부호를 반대로 적거나, 공식 속 부호를 잘못 기억하고 있어 아깝게 틀린 문제가 2문제나 발생하여 감점이 커졌습니다.",
      studyDirections: [
        "**기본 공식 노트 정리 및 백지 테스트**: 인수분해 공식 4가지와 이차방정식 근과 계수의 관계를 직접 백지에 쓸 수 있을 때까지 반복 연습합니다.",
        "**검산 프로세스 일체화**: 연산 후 최종 근을 이차방정식 원본에 대입하여 등식이 성립하는지 5초간 확인하는 검산 습관을 체화합니다.",
        "**중단원 필수 실전 문제 풀이**: 개념과 수식이 결합된 복합 유형 위주로 매일 10문제씩 오답 정리를 구성하여 약점을 극복합니다."
      ],
      keyConceptsToReview: [
        "이차방정식의 근의 공식 및 근과 계수의 관계 유도",
        "인수분해 공식의 응용 및 치환을 통한 복잡한 식의 전개",
        "제곱근의 부호 성질 체화"
      ],
      comprehensiveFeedback: "수학적 순발력과 직관력은 타고난 학생입니다! 다만, 덤벙거리는 연산 실수와 미세한 부호 실수들이 누적되어 실력에 비해 아쉬운 등급을 받았습니다. 이러한 오류들은 조금만 신경 쓰면 충분히 90점대 이상으로 진입할 수 있는 디딤돌입니다. 조급한 마음을 가라앉히고, 매일 오답을 한 줄씩 복기하며 검수 단계를 밟기를 강력히 권장하며, 끝까지 열심히 한 노력을 칭찬합니다!"
    }
  },
  {
    id: "english-reading",
    name: "고1 영어 모의고사 분석",
    description: "독해 영역 어법 및 빈칸 추론 자필 시험지",
    subject: "영어",
    thumbnail: "🔤",
    result: {
      subject: "영어",
      grade: "고등학교 1학년 전국연합학력평가",
      totalScore: 84,
      maxScore: 100,
      gradedQuestions: [
        {
          number: 20,
          isCorrect: true,
          studentAnswer: "2",
          correctAnswer: "2",
          score: 3,
          concept: "필자의 주장 및 대의 파악",
          feedback: "글의 전반부 도입부와 후반부 요지 문장의 시그널 단어에 기반하여 주장을 정확하게 골랐습니다."
        },
        {
          number: 21,
          isCorrect: true,
          studentAnswer: "1",
          correctAnswer: "1",
          score: 3.5,
          concept: "함축 의미 추론",
          feedback: "밑줄 친 비유적 표현이 핵심 주제와 어떻게 유기적으로 연결되는지 탁월한 독해 근거로 맞췄습니다."
        },
        {
          number: 29,
          isCorrect: false,
          studentAnswer: "4",
          correctAnswer: "3",
          score: 4,
          concept: "밑줄 유도형 어법성 중요 판단",
          feedback: "주어와 동사의 수일치(Subject-Verb Agreement)를 놓쳤습니다. 선행 관계대명사 절 내부의 핵심 수식어구를 제외하고 진짜 핵심 주어가 단수인지 복수인지 명확하게 구분하는 연습이 필요합니다."
        },
        {
          number: 31,
          isCorrect: true,
          studentAnswer: "5",
          correctAnswer: "5",
          score: 3.5,
          concept: "빈칸 추론 (단어 수준)",
          feedback: "문맥상 마이너스적인 문맥 흐름을 짚어내고 알맞은 핵심 반의어를 훌륭히 추론해 냈습니다."
        },
        {
          number: 33,
          isCorrect: false,
          studentAnswer: "2",
          correctAnswer: "1",
          score: 4.5,
          concept: "빈칸 추론 (중문 수구 수준)",
          feedback: "글의 일부분만 읽고 성급히 정답을 가늠하여 오답 선지로 이끌렸습니다. 전체 논설문의 소주제와 빈칸이 들어간 문장의 인과 관계를 재정돈하여 정독하여야 합니다."
        },
        {
          number: 36,
          isCorrect: true,
          studentAnswer: "3",
          correctAnswer: "3",
          score: 3.5,
          concept: "글의 순서 배열 파악",
          feedback: "지시어(this, they)의 연결 단서를 아주 집요하게 추적하여 빈틈없이 배열을 고정하였습니다."
        },
        {
          number: 38,
          isCorrect: true,
          studentAnswer: "4",
          correctAnswer: "4",
          score: 4,
          concept: "문장 삽입 위치 파악",
          feedback: "역접 접속사 'However' 주변 문장의 흐름상 단절을 단숨에 파악하여 명쾌하게 구획을 확정지었습니다."
        }
      ],
      weaknessAnalysis: "영어 독해의 흐름 및 논리 맥락 파악은 최정상급입니다. 다만, 고화질 등급 달성을 미끄러트리는 주 요인은 '문법적 관계 파악' 및 '고난도 어휘력 기반 세부 정독'의 미비로 파악됩니다.\n특히 어법 문항에서 수일치 수식 관계를 놓쳤고, 빈칸 추론에서 역설 문맥을 건너짚는 경향이 있어 감점이 발생했습니다.",
      studyDirections: [
        "**구문 연마 및 끊어 읽기 일체화**: 관계사절, 분사구 등 주어를 다채롭게 수식하는 구조를 묶어 주어-동사의 수일치 수형 구조를 짚어내는 구문 공부를 복습합니다.",
        "**오답 선지 제거 훈련**: 빈칸 추론 오답율 극복을 위해, 오답 선지가 왜 매력적 함정인지 문맥적 원인을 규명하고 오답 소거법을 적극 적용합니다.",
        "**고난도 동의어/반의어 정리**: 매일 틀린 문항 단어장 정리를 통해 문맥 핵심 대체 어휘를 대폭 증강시켜 고질적인 정독 정확도를 강화합니다."
      ],
      keyConceptsToReview: [
        "주어-동사 원형과 관계 사절 수식 수일치 문법 규칙",
        "분사구문 및 관계 부사의 문법적 격 분석",
        "소재별 핵심 핵심 시그널 연결사 정리"
      ],
      comprehensiveFeedback: "체계적인 영어 스캐닝 능력 덕분에 논리 추론성 문제에서 뛰어난 강점을 보여줍니다! 조금 지엽적이지만 언제든 등급을 앗아갈 수 있는 세부 어법과 긴 문장의 구문 구획을 칼같이 분석하는 기초 훈련을 입혀준다면 다가오는 본 시험에서는 무난히 만점 및 최상위 성과를 정복할 수 있을 것입니다. 자신의 장점을 믿고 꾸준히 단어 암기와 문법 수축에 시간을 할애하세요. 화이팅입니다!"
    }
  }
];
