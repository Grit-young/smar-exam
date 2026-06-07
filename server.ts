import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits for processing high-resolution test paper images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Test Server Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Analyze Test Paper(s) using Gemini API
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, images } = req.body;
      
      // Support both single image (legacy) and multiple images (new)
      let imageList: string[] = [];
      if (Array.isArray(images) && images.length > 0) {
        imageList = images;
      } else if (image) {
        imageList = [image];
      }

      if (imageList.length === 0) {
        res.status(400).json({ error: "이미지 데이터가 전송되지 않았습니다." });
        return;
      }

      // Check for Gemini API key and get client
      let ai;
      try {
        ai = getGeminiClient();
      } catch (keyError: any) {
        console.error("Gemini key initialization fail:", keyError.message);
        res.status(500).json({
          error: "Gemini API key 설정이 누락되었습니다. AI Studio 설정에서 GEMINI_API_KEY를 추가해 주세요.",
          details: keyError.message,
        });
        return;
      }

      // Prepare multiple inlineData payloads
      const contentsParts: any[] = [];
      
      for (let i = 0; i < imageList.length; i++) {
        const imgData = imageList[i];
        let base64Data = imgData;
        let mimeType = "image/jpeg";

        if (imgData.startsWith("data:")) {
          const parts = imgData.split(",");
          const match = imgData.match(/data:([^;]+);/);
          if (match) mimeType = match[1];
          base64Data = parts[1];
        } else {
          // Fallback if raw base64 is sent without data scheme
          base64Data = imgData;
        }

        contentsParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          }
        });
      }

      console.log(`Starting test paper analysis. Total images: ${imageList.length}`);

      // Add instruction query text as part of the contents
      contentsParts.push({
        text: `업로드된 ${imageList.length}장의 시험지 이미지들은 순서대로 한 명의 학생이 풀어서 채점이 되었거나 채점되지 않은 시험지의 각 페이지 사진들입니다.
시험지 전체를 완벽하고 꼼꼼하게 통합 분석 및 교차 채점해 주세요.

기존에 이미 빨간 동그라미나 V 표시, 사선(/) 등의 매겨진 채점 흔적이 있다면 이를 1차로 파악하시고, 
체크가 누락되었거나 틀린 표기가 있다면 학생의 자필 작성 답안과 전반적인 풀이 흔적을 정밀 분석하여 직접 올바른 정답 여부를 채점해야 합니다.
학생의 단원을 아우르는 통합적 시험 결과에 관해 정밀 가치 진단 분석을 진행해 주세요.

각 감지된 모든 문항들의 배점을 합산하여 원점수 총합(totalScore) 및 시험지 만점(maxScore - 명시되어 있지 않은 경우 100을 기본)을 구하고, 
각 문항에 대해 빠짐없이 오답 유무(isCorrect), 정오 정보, 출격 영역 개념(concept), 구체적인 맞춤식 설명 피드백(feedback)을 작성해 주세요. 여러 페이지에 걸친 문항들의 번호 순서를 알맞게 정리해서 하나의 정오표 리스트로 생성해 주세요.`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsParts,
        config: {
          systemInstruction: `당신은 대한민국 대표 최고의 명문 학교 교사이자 교육 평가/학습 진단 전문가입니다.
학생이 업로드한 모든 시험지 이미지 속의 문항들을 정확히 인식하고, 학생의 풀이와 채점 기록을 기반으로 학생의 공부 역량, 취약 영역을 정성·정량적으로 정확하게 진단 분석하십시오.
응답 데이터는 명시된 JSON Schema 형식대로 무조건 반환해야 하며, 분석 전후에 다른 텍스트 설명이나 마크다운 꼬리표가 섞여서 들어가서는 안 됩니다. 
모든 텍스트 피드백과 설명은 학생과 그 학부모가 모두 공감하고 실행할 수 있도록 정중하고 전문적인 한국어로 경어체를 사용하여 자상하게 기술하십시오.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: "시험 과목 (예: 수학, 영어, 과학, 국어, 역사, 사회 등)" },
              grade: { type: Type.STRING, description: "학년 학기 정보 (예: 중학교 2학년 1학기, 고등학교 수학I 등)" },
              totalScore: { type: Type.INTEGER, description: "시험지 채점 결과 보정된 학생의 원점수 실점수 총합" },
              maxScore: { type: Type.INTEGER, description: "해당 시험지의 원래 총 만점 (보통 100점)" },
              gradedQuestions: {
                type: Type.ARRAY,
                description: "시험지에서 감지된 문제들과 각각에 대한 채점 및 처방 목록",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER, description: "문항 번호" },
                    isCorrect: { type: Type.BOOLEAN, description: "채점 결과 정답 여부 (정답이면 true, 틀렸으면 false)" },
                    studentAnswer: { type: Type.STRING, description: "학생이 작성하거나 선택한 텍스트 또는 번호 (자필이 판독 불가능하거나 비어있다면 '미작성'으로 작성)" },
                    correctAnswer: { type: Type.STRING, description: "실제 실제 문항의 출제자 정답" },
                    score: { type: Type.NUMBER, description: "해당 문항의 배점" },
                    concept: { type: Type.STRING, description: "문항의 대표적인 출제 교과 단원명 또는 학업 개념 요약" },
                    feedback: { type: Type.STRING, description: "틀렸다면 상세 접근법 교정/실수 보완 피드백, 맞았다면 핵심 칭찬 및 주의할 함정 코멘트" },
                  },
                  required: ["number", "isCorrect", "studentAnswer", "correctAnswer", "score", "concept", "feedback"],
                },
              },
              weaknessAnalysis: { type: Type.STRING, description: "오답 성향과 틀린 문제들을 토대로 진성 원인을 분석한 전방위 약점 파헤치기 보고서" },
              studyDirections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "향후 보충을 완료하기 위한 명확하고 구체적인 실행 계획적 공부 방향 및 추천 방법 (3~5개 항목)"
              },
              keyConceptsToReview: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "교과서 및 개념서에서 필수적으로 복습해야 하는 단원/핵심 핵심 원리 키워드들 목록"
              },
              comprehensiveFeedback: { type: Type.STRING, description: "수준 높은 종합 보강 메시지와 학생을 전인적으로 격려하는 따뜻한 격려 교육 조언" },
            },
            required: [
              "subject",
              "grade",
              "totalScore",
              "maxScore",
              "gradedQuestions",
              "weaknessAnalysis",
              "studyDirections",
              "keyConceptsToReview",
              "comprehensiveFeedback"
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini API로부터 응답 텍스트를 받지 못했습니다.");
      }

      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Test paper analysis process failed:", error);
      res.status(500).json({
        error: "시험지 분석 중 내부 서버 에러가 발생했습니다.",
        details: error.message || "Unknown error",
      });
    }
  });

  // Serve static files to production or inject Vite Dev middlewares
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Express with Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build outputs statically in production...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server fully initialized and running on http://localhost:${PORT}`);
  });
}

startServer();
