import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Award, 
  Compass, 
  RefreshCw, 
  Layers, 
  GraduationCap, 
  ArrowLeft,
  Lightbulb,
  ArrowRight,
  Trash2,
  Plus
} from "lucide-react";
import { SAMPLE_DATASETS, SampleTestPaper } from "./data/samples";
import { AnalysisResult } from "./types";

export default function App() {
  // Application State - Multi-file Support
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [usedSampleId, setUsedSampleId] = useState<string | null>(null);
  const [activePreviewIdx, setActivePreviewIdx] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle files selection & append (so users can upload more images)
  const processFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    let fileReadCount = 0;
    const targetLength = files.length;

    if (targetLength === 0) return;

    setErrorMsg(null);
    setUsedSampleId(null);

    for (let i = 0; i < targetLength; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setErrorMsg("이미지 파일만 지원됩니다 (.png, .jpg, .jpeg, .webp)");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("파일 중 하나가 너무 큽니다. (15MB 이하의 이미지만 가능합니다)");
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Read files as base64 in parallel
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        newPreviews.push(resultStr);
        fileReadCount++;

        if (fileReadCount === validFiles.length) {
          // If previous preview was "SAMPLE_DATASET", clear it first
          setImagePreviews((prev) => {
            const filteredPrev = prev.filter(p => p !== "SAMPLE_DATASET");
            return [...filteredPrev, ...newPreviews];
          });
          setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
      };
      reader.onerror = () => {
        setErrorMsg("일부 이미지를 파일로 변환하는 중 오류가 발생했습니다.");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Delete a specific uploaded page/image
  const handleDeleteImage = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePreviewIdx >= imagePreviews.length - 1) {
      setActivePreviewIdx(Math.max(0, imagePreviews.length - 2));
    }
  };

  // Run the batch analysis via the API
  const handleStartAnalysis = async () => {
    if (imagePreviews.length === 0) {
      setErrorMsg("분석할 시험지 사진을 1장 이상 등록해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    // Filter out sample markers if any
    const apiImages = imagePreviews.filter(p => p !== "SAMPLE_DATASET");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: apiImages }),
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { error: "서버가 정상적으로 응답하지 않습니다." };
        }
        throw new Error(errData.error || `서버 분석 실패 (코드 ${response.status})`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "분석 과정 중 뜻하지 않은 에러가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load a quick sample
  const handleApplySample = (sample: SampleTestPaper) => {
    setImagePreviews(["SAMPLE_DATASET"]);
    setSelectedFiles([]);
    setUsedSampleId(sample.id);
    setAnalysisResult(sample.result);
    setErrorMsg(null);
    setActivePreviewIdx(0);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setImagePreviews([]);
    setAnalysisResult(null);
    setErrorMsg(null);
    setUsedSampleId(null);
    setActivePreviewIdx(0);
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] pb-24 text-[#1a2744]">
      {/* Top Header Grid Area */}
      <header id="app-header" className="sticky top-0 z-40 border-b border-[#ebdcd0] bg-[#f5f0eb]/90 py-5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a2744] text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display text-xs font-semibold tracking-wider text-[#f97316]">CLASSROOM DIAGNOSIS AI</span>
              <h1 className="text-xl font-bold tracking-tight text-[#1a2744] sm:text-2xl">시험지 분석기</h1>
            </div>
          </div>
          
          <div className="hidden items-center space-x-2 text-xs sm:flex">
            <span className="inline-flex items-center rounded-full bg-[#ebdcd0] px-3 py-1 font-medium text-[#1a2744]">
              <Sparkles className="mr-1 h-3 w-3 text-[#f97316]" /> Gemini 3.5 Flash 구동 중
            </span>
          </div>
        </div>
      </header>

      {/* Main Core Viewport */}
      <main className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        
        {/* Dynamic Split Layout: Input Section & Sample Cards */}
        {!analysisResult && !isLoading ? (
          <div className="grid gap-8 lg:grid-cols-12 border-t border-[#ebdcd0] mt-6 pt-6">
            
            {/* Left Side: Upload & Action Panel */}
            <div className="lg:col-span-8">
              <div id="upload-panel" className="rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm transition-all sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1a2744]">
                    시험지 이미지 등록 ({imagePreviews.length}장 선택됨)
                  </h3>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                    >
                      전체 삭제
                    </button>
                  )}
                </div>

                {/* Upload input multiple and drag over area */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                />

                {imagePreviews.length > 0 ? (
                  <div className="space-y-6">
                    {/* Active Preview Frame */}
                    <div className="relative rounded-2xl border border-[#ebdcd0] bg-[#faf8f6] p-4 text-center">
                      {imagePreviews[activePreviewIdx] === "SAMPLE_DATASET" ? (
                        <div className="mx-auto flex h-52 max-w-sm flex-col items-center justify-center rounded-xl bg-[#f5f0eb] p-6 text-center border border-[#ebdcd0]">
                          <FileText className="mb-3 h-12 w-12 text-[#1a2744]" />
                          <p className="font-bold text-[#1a2744]">체험형 데모 샘플 데이터셋</p>
                          <p className="text-xs text-[#52453e] mt-1">서버 리소스를 소모하지 않고 준비된 수학/영어 종합 분석 결과를 체험합니다.</p>
                        </div>
                      ) : (
                        <div className="relative mx-auto max-h-80 max-w-md overflow-hidden rounded-xl border border-[#ebdcd0] bg-white shadow-sm flex items-center justify-center">
                          <img
                            src={imagePreviews[activePreviewIdx]}
                            alt={`선택된 시험지 ${activePreviewIdx + 1}`}
                            className="max-h-80 object-contain w-full p-2"
                          />
                          <div className="absolute top-2 left-2 rounded bg-[#1a2744]/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            PAGE {activePreviewIdx + 1}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Horizontal Scroller Carousel for select and configure */}
                    <div>
                      <p className="text-xs font-bold text-[#6e5d53] mb-2 uppercase tracking-wide">등록된 시험지 목록 (순서대로 분석됩니다)</p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                        {imagePreviews.map((preview, i) => (
                          <div
                            key={i}
                            onClick={() => setActivePreviewIdx(i)}
                            className={`group relative aspect-[3/4] cursor-pointer rounded-xl border-2 overflow-hidden transition-all bg-white flex items-center justify-center ${
                              activePreviewIdx === i 
                                ? "border-[#f97316]" 
                                : "border-[#ebdcd0] hover:border-[#1a2744]/60"
                            }`}
                          >
                            {preview === "SAMPLE_DATASET" ? (
                              <div className="text-center p-1">
                                <FileText className="mx-auto h-6 w-6 text-[#1a2744]" />
                                <span className="text-[9px] font-bold text-[#1a2744] block mt-1">SAMPLE</span>
                              </div>
                            ) : (
                              <img
                                src={preview}
                                alt={`썸네일 ${i + 1}`}
                                className="h-full w-full object-cover p-0.5"
                              />
                            )}

                            {/* Page Indicator Overlay */}
                            <span className="absolute bottom-1 left-1 rounded bg-[#1a2744]/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {i + 1}p
                            </span>

                            {/* Single Thumbnail Deletor icon */}
                            {preview !== "SAMPLE_DATASET" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(i);
                                }}
                                className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded bg-red-600 text-white shadow transition-all hover:bg-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Additional trigger box inside layouts */}
                        {imagePreviews[0] !== "SAMPLE_DATASET" && (
                          <div
                            onClick={handleUploadAreaClick}
                            className="aspect-[3/4] cursor-pointer rounded-xl border-2 border-dashed border-[#d8c3b5] hover:border-[#f97316] hover:bg-[#faf8f6] flex flex-col items-center justify-center text-center transition"
                          >
                            <Plus className="h-6 w-6 text-[#f97316]" />
                            <span className="text-[10px] font-semibold text-[#1a2744] mt-1">시험지 추가</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Big Upload Trigger Area */
                  <div
                    id="drop-target-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadAreaClick}
                    className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragOver 
                        ? "border-[#f97316] bg-[#fdfaf7]" 
                        : "border-[#d8c3b5] hover:border-[#f97316] hover:bg-[#faf8f6]"
                    }`}
                  >
                    <div className="space-y-4 py-8">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fcf8f5] text-[#f97316] shadow-sm border border-[#ebdcd0]">
                        <Upload className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-[#1a2744]">
                          시험지 사진들을 여기에 놓거나 클릭하세요
                        </p>
                        <p className="text-xs text-[#6e5d53]">
                          카메라로 찍은 시험지 한 장 또는 <b>여러 장을 한꺼번에 선택</b>도 가능합니다 (.jpg, .png)
                        </p>
                      </div>
                      <div className="inline-flex items-center justify-center rounded-lg bg-[#ebdcd0]/40 px-4 py-1.5 text-xs font-medium text-[#1a2744]">
                        드래그 앤 드롭 및 다중 선택 지원
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner inside form panel */}
                {errorMsg && (
                  <div className="mt-4 flex items-start space-x-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100 animate-fadeIn">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-bold">안내 및 오류</p>
                      <p className="text-xs text-red-700/95 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Action Orange Button */}
                <div className="mt-6">
                  <button
                    id="btn-analyze-start"
                    disabled={imagePreviews.length === 0 || imagePreviews[0] === "SAMPLE_DATASET"}
                    onClick={handleStartAnalysis}
                    className={`flex w-full items-center justify-center rounded-xl py-4 px-6 text-base font-bold text-white shadow-md transition-all ${
                      imagePreviews.length === 0
                        ? "bg-[#ebdcd0] cursor-not-allowed shadow-none text-[#a59184]"
                        : imagePreviews[0] === "SAMPLE_DATASET"
                          ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none hover:none"
                          : "bg-[#f97316] hover:bg-[#ea580c] hover:shadow-lg active:scale-[0.98]"
                    }`}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {imagePreviews[0] === "SAMPLE_DATASET" 
                      ? "체험용 샘플 분석 결과가 우측에 이미 활성화되었습니다!" 
                      : `총 ${imagePreviews.length}장의 시험지 분석 시작`}
                  </button>
                  <p className="text-center text-xs text-[#6e5d53] mt-2.5">
                    * 여러 장을 분석할 시, 누락 없는 교차 정밀 조율을 위해 분량이 걸릴 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Quick Preloaded Tester Sandbox */}
            <div className="lg:col-span-4 space-y-6">
              <div id="samples-panel" className="rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#f97316]" />
                  <h4 className="text-base font-bold text-[#1a2744]">샘플 시험지 간편 시연</h4>
                </div>
                <p className="text-xs text-[#52453e] mb-4 leading-relaxed">
                  준비된 과목별 모의 실전 시험지 결과를 즉시 시연해 보세요. 손글씨 채점 자국 파악과 정성 피드백을 한 눈에 확인하고 체험하실 수 있습니다.
                </p>

                <div className="space-y-3">
                  {SAMPLE_DATASETS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleApplySample(sample)}
                      className="group flex w-full items-start space-x-3 rounded-xl border border-[#ebdcd0] bg-[#faf8f6] p-3 text-left transition hover:border-[#f97316] hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ebdcd0] text-xl transition group-hover:bg-[#1a2744]/10">
                        {sample.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="truncate text-sm font-bold text-[#1a2744] group-hover:text-[#f97316]">
                          {sample.name}
                        </h5>
                        <p className="text-xs text-[#6e5d53] mt-0.5 line-clamp-1">{sample.description}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-medium bg-[#1a2744]/10 text-[#1a2744] px-1.5 py-0.5 rounded">
                          {sample.subject} • 만점 {sample.result.maxScore}점
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#6e5d53] self-center group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-[#fdfaf7] p-3 text-[11px] text-amber-800 border border-amber-100">
                  ⚠️ 본인의 시험지를 채점하고 싶다면 왼쪽 영역에 원본 사진을 드랍시킨 뒤 <b>주황색 분석 시작 버튼</b>을 눌러주세요.
                </div>
              </div>

              {/* Service Features Block */}
              <div className="rounded-3xl bg-[#1a2744] p-6 text-white shadow-sm">
                <h4 className="text-sm font-bold tracking-wider text-[#f97316] uppercase">AI ANALYSIS TECH</h4>
                <h3 className="text-lg font-bold mt-1 text-white">자동 분석 프로세스</h3>
                
                <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
                  <li className="flex items-start">
                    <span className="mr-2 text-[#f97316] font-bold">1.</span>
                    <span><b>답안 및 손글씨 판독:</b> 첨단 비전 파싱으로 학생의 자필 답과 채점 구획을 인식합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#f97316] font-bold">2.</span>
                    <span><b>교과 지식 매핑:</b> 수학/영어 등 출제 범위 단원의 핵심 개별 개념을 추출합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#f97316] font-bold">3.</span>
                    <span><b>취약 보강 가이드:</b> 처방식 문제 해결 피드백과 회복 계획 리포트를 자상하게 한글로 제공합니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Loading Spinner Screen */}
        {isLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-[#ebdcd0] bg-white p-8 text-center shadow-sm">
            <div className="relative">
              {/* Outer double rotating spin */}
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#ebdcd0] border-t-[#f97316]"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-[#f97316]" />
            </div>
            
            <h3 className="mt-6 text-xl font-bold text-[#1a2744]">AI가 시험지 분석 보고서를 생성하는 중...</h3>
            <p className="text-sm text-[#52453e] max-w-md mt-2 leading-relaxed">
              시험지 문항 분석, 자필 답안 채점 보정, 교과 영역 융합, 장오 치료 가이드 및 종합 학업 성향 분석을 면밀히 조직하고 있습니다. 잠시만 기다려 주세요.
            </p>

            <div className="mt-8 max-w-sm w-full bg-[#fdfaf7] rounded-xl p-4 border border-[#ebdcd0] text-left text-xs text-amber-800 space-y-1.5">
              <p className="font-bold flex items-center">
                <Lightbulb className="h-4 w-4 text-[#f97316] mr-1 inline shrink-0" />
                분석 소요 시간 팁
              </p>
              <p className="text-[#645043]">
                고해상도 이미지일수록 텍스트 구조를 해석하는 데 더 명확한 시야를 가집니다. 일반적으로 15초에서 30초 내에 완벽한 성적표 리포트가 완성됩니다.
              </p>
            </div>
          </div>
        )}

        {/* ANALYSIS RESULTS PANEL (DISPLAYING GRADED METRICS) */}
        {analysisResult && !isLoading && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header / Navigate back bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-fit items-center space-x-2 text-sm font-bold text-[#1a2744] hover:text-[#f97316] transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전 단계로 / 새 시험지 업로드</span>
              </button>

              <div className="flex items-center space-x-2">
                {usedSampleId ? (
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-600 font-medium font-mono">
                    DEMO SAMPLE: {usedSampleId}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium">
                    실시간 AI 분석 완료
                  </span>
                )}
                <button
                  onClick={handleReset}
                  className="rounded-lg bg-[#1a2744] text-white px-3 py-1.5 text-xs font-semibold shadow hover:bg-[#2b3c64] flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>다시 분석</span>
                </button>
              </div>
            </div>

            {/* Core Scoreboard Cards (Grid) */}
            <div className="grid gap-6 md:grid-cols-12">
              
              {/* Left card: Main Score Arc and grade details */}
              <div className="md:col-span-8 rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ebdcd0] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[#f97316] tracking-wider uppercase">RESULT REPORT</span>
                      <h2 className="text-2xl font-black text-[#1a2744]">{analysisResult.subject} 평가 리포트</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1a2744]">{analysisResult.grade}</p>
                      <p className="text-xs text-[#6e5d53]">단원/종합 진단 스코어링</p>
                    </div>
                  </div>

                  {/* Weakness analysis summary text paragraph */}
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-[#1a2744] flex items-center space-x-1.5 mb-2.5">
                      <Layers className="h-4 w-4 text-[#f97316]" />
                      <span>오답 원인 분석 성향 및 취약 대진단</span>
                    </h4>
                    <p className="text-sm text-[#52453e] leading-relaxed whitespace-pre-line bg-[#fdfaf7] p-4 rounded-2xl border border-[#ebdcd0]">
                      {analysisResult.weaknessAnalysis}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-[#fbf5f0] border-t border-[#ebdcd0] pt-4">
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8 text-[#f97316] shrink-0" />
                    <div>
                      <p className="text-xs text-[#6e5d53]">종합 역량 평가</p>
                      <p className="text-sm font-bold text-[#1a2744]">
                        {analysisResult.totalScore >= 90 ? "최우수 영역 (A등급)" : 
                         analysisResult.totalScore >= 80 ? "우수 영역 (B등급)" :
                         analysisResult.totalScore >= 70 ? "보충 필요 (C등급)" : "집중 클리닉 (D등급)"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#6e5d53]">출제 범위 만점 기준 : </span>
                    <span className="text-sm font-bold text-[#1a2744]">{analysisResult.maxScore}점</span>
                  </div>
                </div>
              </div>

              {/* Right card: Radial score meter representation */}
              <div className="md:col-span-4 rounded-3xl border border-[#ebdcd0] bg-[#1a2744] p-6 shadow-md text-white flex flex-col items-center justify-center text-center">
                <span className="text-[#f97316] text-xs font-bold tracking-wider mb-2">SCORE SUMMARY</span>
                <span className="text-2xl font-display font-black text-white/90">{analysisResult.subject}</span>
                
                {/* Custom Big Score Gauge */}
                <div className="relative my-6 flex h-40 w-40 items-center justify-center">
                  {/* Background rotating radial border */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-700/50"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#f97316] transition-all duration-1000"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysisResult.totalScore / (analysisResult.maxScore || 100))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="font-display text-4xl font-black text-white">{analysisResult.totalScore}</p>
                    <p className="text-xs text-slate-300 border-t border-slate-700 mt-1 pt-1">/ {analysisResult.maxScore || 100} 점</p>
                  </div>
                </div>

                <div className="w-full bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">획득 문항 수 :</span>
                    <span className="font-bold text-white">
                      {analysisResult.gradedQuestions.filter(q => q.isCorrect).length} / {analysisResult.gradedQuestions.length} 문항
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-slate-300">정답 오답 스펙트럼 :</span>
                    <span className="font-bold text-[#f97316]">
                      {((analysisResult.gradedQuestions.filter(q => q.isCorrect).length / analysisResult.gradedQuestions.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Dynamic visual Graded Questions Red-circles Checkboard list */}
            <div id="graded-questions" className="rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#ebdcd0] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1a2744] flex items-center space-x-1.5">
                    <FileText className="h-5 w-5 text-[#f97316]" />
                    <span>문항별 채점 결과 및 정오표 피드백</span>
                  </h3>
                  <p className="text-xs text-[#52453e] mt-1">시험지 사진에서 학생의 자필 작성 답안과 채점 표식을 AI가 면밀히 대조해 도출한 피드백입니다.</p>
                </div>
                {/* Interactive Legends for easy reading */}
                <div className="flex space-x-3 text-xs">
                  <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" /> 정답
                  </span>
                  <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded">
                    <XCircle className="mr-1 h-3.5 w-3.5 text-red-600" /> 오답
                  </span>
                </div>
              </div>

              {/* Responsive table-like structure using nice cards with hand-labeled circles */}
              <div className="space-y-4">
                {analysisResult.gradedQuestions.map((q) => (
                  <div 
                    key={q.number}
                    className={`relative rounded-2xl border p-5 transition hover:shadow-md ${
                      q.isCorrect 
                        ? "border-emerald-100 bg-[#f9fdfa]" 
                        : "border-red-100 bg-[#fdf9f9]"
                    }`}
                  >
                    {/* Red scoring pen mark overlay style */}
                    <div className="absolute top-4 right-4 flex items-center">
                      {q.isCorrect ? (
                        <div className="relative flex items-center justify-center">
                          {/* Beautiful red big crayon circle reminiscent of Korean grading style (동그라미) */}
                          <div className="absolute h-12 w-12 rounded-full border-4 border-red-500/30 animate-pulse scale-110"></div>
                          <div className="absolute h-10 w-10 rounded-full border-2 border-red-600/60"></div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">정답</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          {/* Slash mark representing incorrect (사선 /) */}
                          <div className="absolute h-1 w-10 bg-red-500/60 rotate-45 transform"></div>
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">오답</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left Block: Question Number and concept summary */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2744] text-xs font-bold text-white">
                            {q.number}번
                          </span>
                          <span className="inline-block rounded-md bg-[#ebdcd0]/60 px-2.5 py-0.5 text-xs font-bold text-[#1a2744]">
                            {q.concept}
                          </span>
                          <span className="text-xs text-[#52453e]">배점: {q.score}점</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-sm mt-3 pt-2 border-t border-[#ebdcd0]/40 text-xs">
                          <div>
                            <span className="text-[#6e5d53] block">작성한 답안</span>
                            <span className="font-bold text-[#1a2744] text-sm break-all pt-0.5 block">{q.studentAnswer || "빈칸"}</span>
                          </div>
                          <div>
                            <span className="text-[#6e5d53] block">출제 정답</span>
                            <span className="font-bold text-[#1a2744] text-sm break-all pt-0.5 block">{q.correctAnswer}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Direct custom pedagogical feedback prescription */}
                      <div className="flex-1 md:max-w-2xl bg-white border border-[#ebdcd0]/40 rounded-xl p-3 text-xs sm:text-sm text-[#1a2744] leading-relaxed">
                        <p className="font-bold text-[#f97316] mb-1 text-[11px] uppercase tracking-wider">AI 처방 피드백</p>
                        <p className="text-[#1a2744]">{q.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Grid: 2-Column layout for study directions & Concepts */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Study Directions Card */}
              <div className="rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm md:p-8">
                <h3 className="mb-4 text-base font-bold text-[#1a2744] flex items-center space-x-1.5">
                  <Compass className="h-5 w-5 text-[#f97316]" />
                  <span>맞춤 치료 학습 방향 제안</span>
                </h3>
                <ol className="space-y-4">
                  {analysisResult.studyDirections.map((dir, i) => {
                    const formatted = dir.includes("**") 
                      ? dir.split("**").map((text, idx) => idx % 2 === 1 ? <strong key={idx} className="text-[#1a2744] font-extrabold">{text}</strong> : text) 
                      : dir;

                    return (
                      <li key={i} className="flex items-start">
                        <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fdf3ec] text-xs font-bold text-[#f97316]">
                          {i + 1}
                        </span>
                        <div className="text-xs sm:text-sm text-[#52453e] leading-relaxed">
                          {formatted}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Key Concepts To Review Card */}
              <div className="rounded-3xl border border-[#ebdcd0] bg-white p-6 shadow-sm md:p-8">
                <h3 className="mb-4 text-base font-bold text-[#1a2744] flex items-center space-x-1.5">
                  <BookOpen className="h-5 w-5 text-[#f97316]" />
                  <span>필수 복습 교과 핵심 완결판 선구안</span>
                </h3>
                <p className="text-xs text-[#6e5d53] mb-4">
                  기본서 및 교과서를 펼쳐 반드시 이론적 기초를 점검해야 하는 우선순위 단원들 목록입니다.
                </p>

                <div className="space-y-3">
                  {analysisResult.keyConceptsToReview.map((concept, i) => (
                    <div 
                      key={i} 
                      className="flex items-center space-x-2.5 rounded-xl border border-[#ebdcd0]/60 bg-[#fdfbf9] p-3 text-xs sm:text-sm text-[#1a2744]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#f97316]"></span>
                      <span className="font-bold flex-1">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Touch: Comprehensive Warm Feedback Panel (Callout Banner) */}
            <div className="rounded-3xl bg-[#1a2744] text-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-6 w-6 text-[#f97316]" />
                    <span className="text-xs font-bold text-[#f97316] tracking-wider uppercase">PEDAGOGICAL WRAP-UP</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">따뜻한 희망의 격려 메시지</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed whitespace-pre-line pt-1 text-justify">
                    {analysisResult.comprehensiveFeedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Back Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-xl bg-[#1a2744] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2b3c64] hover:shadow-lg"
              >
                새로운 시험지 추가로 업로드 및 분석
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer Area with clear guidelines */}
      <footer id="app-footer" className="mx-auto mt-20 max-w-6xl px-4 text-center text-xs text-[#a59184]">
        <div className="border-t border-[#ebdcd0] pt-6 space-y-2">
          <p className="font-medium text-[#6e5d53]">© 2026 AI 시험지 분석 연구소. All rights reserved.</p>
          <p>
            본 분석기는 업로드된 사진 속의 학생 손글씨 패턴과 정밀 채점 내역을 기반으로 AI 솔루션을 추천합니다.<br />
            실제 공인 성적과는 차이가 있을 수 있으므로 자녀 성향의 보충 학습용 진단 분석 모델로서 참고해 주십시오.
          </p>
        </div>
      </footer>
    </div>
  );
}
