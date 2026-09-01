"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Copy,
  Trash2,
} from "lucide-react";

export type AssessmentQuestionType = "single" | "multiple" | "boolean";

export interface AssessmentOption {
  id: string;
  label: string;
  correct: boolean;
  feedback?: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  category?: string;
  type: AssessmentQuestionType;
  options: AssessmentOption[];
}

export interface AssessmentDefinition {
  formatVersion: 2;
  title: string;
  questions: AssessmentQuestion[];
}

function newId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function newOption(label = ""): AssessmentOption {
  return { id: newId("option"), label, correct: false, feedback: "" };
}

function newQuestion(): AssessmentQuestion {
  return {
    id: newId("question"),
    prompt: "",
    category: "",
    type: "single",
    options: [newOption(), newOption()],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseAssessmentDefinition(
  raw: string | unknown,
  fallbackTitle: string,
): AssessmentDefinition {
  let value: unknown = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) value = null;
    else {
      try {
        value = JSON.parse(raw);
      } catch {
        value = null;
      }
    }
  }
  const record = asRecord(value);
  const sourceQuestions = Array.isArray(value)
    ? value
    : Array.isArray(record?.questions)
      ? record.questions
      : [];

  const questions = sourceQuestions.flatMap((item, questionIndex) => {
    const question = asRecord(item);
    if (!question) return [];
    const sourceOptions = Array.isArray(question.options)
      ? question.options
      : Array.isArray(question.alternativas)
        ? question.alternativas
        : [];
    const legacyCorrectId = String(question.correctOptionId ?? "");
    const legacyCorrectIds = Array.isArray(question.correctOptionIds)
      ? question.correctOptionIds.map(String)
      : [];
    const options = sourceOptions.flatMap((optionItem, optionIndex) => {
      const option = asRecord(optionItem);
      if (!option) return [];
      const id = String(option.id || `option-${questionIndex}-${optionIndex}`);
      return [
        {
          id,
          label: String(option.label ?? option.texto ?? ""),
          correct:
            option.correct === true ||
            option.correta === true ||
            legacyCorrectId === id ||
            legacyCorrectIds.includes(id),
          feedback:
            typeof option.feedback === "string" ? option.feedback : "",
        },
      ];
    });
    const rawType = String(question.type ?? question.tipo ?? "single");
    const type: AssessmentQuestionType =
      rawType === "multiple" || rawType === "multipla_escolha"
        ? "multiple"
        : rawType === "boolean" || rawType === "verdadeiro_falso"
          ? "boolean"
          : "single";
    return [
      {
        id: String(question.id || `question-${questionIndex}`),
        prompt: String(question.prompt ?? question.pergunta ?? ""),
        category: String(
          question.category ?? question.categoria ?? question.sectionTitle ?? "",
        ),
        type,
        options,
      },
    ];
  });

  return {
    formatVersion: 2,
    title:
      typeof record?.title === "string" && record.title.trim()
        ? record.title
        : fallbackTitle,
    questions,
  };
}

export function assessmentDefinitionToJson(value: AssessmentDefinition) {
  return JSON.stringify(value);
}

export function validateAssessmentDefinition(value: AssessmentDefinition) {
  const errors: string[] = [];
  if (value.questions.length === 0) {
    errors.push("adicione pelo menos uma pergunta");
  }

  value.questions.forEach((question, questionIndex) => {
    const label = `pergunta ${questionIndex + 1}`;
    if (!question.prompt.trim()) errors.push(`${label}: informe o enunciado`);
    if (question.options.length < 2) {
      errors.push(`${label}: adicione pelo menos duas alternativas`);
    }
    if (question.options.some((option) => !option.label.trim())) {
      errors.push(`${label}: preencha todas as alternativas`);
    }
    const correctCount = question.options.filter(
      (option) => option.correct,
    ).length;
    if (correctCount === 0) {
      errors.push(`${label}: marque a resposta correta`);
    }
    if (question.type !== "multiple" && correctCount > 1) {
      errors.push(`${label}: marque apenas uma resposta correta`);
    }
  });

  return errors;
}

interface AssessmentBuilderProps {
  value: string | unknown;
  onChange: (value: AssessmentDefinition) => void;
  title: string;
  description: string;
  showTitle?: boolean;
}

export function AssessmentBuilder({
  value,
  onChange,
  title,
  description,
  showTitle = false,
}: AssessmentBuilderProps) {
  const definition = useMemo(
    () => parseAssessmentDefinition(value, title),
    [title, value],
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(definition.questions.slice(0, 1).map((question) => question.id)),
  );

  const commit = (next: AssessmentDefinition) => onChange(next);
  const updateQuestion = (
    questionId: string,
    updater: (question: AssessmentQuestion) => AssessmentQuestion,
  ) =>
    commit({
      ...definition,
      questions: definition.questions.map((question) =>
        question.id === questionId ? updater(question) : question,
      ),
    });

  const addQuestion = () => {
    const question = newQuestion();
    commit({ ...definition, questions: [...definition.questions, question] });
    setExpandedIds((current) => new Set([...current, question.id]));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= definition.questions.length) return;
    const questions = [...definition.questions];
    [questions[index], questions[target]] = [questions[target], questions[index]];
    commit({ ...definition, questions });
  };

  const removeQuestion = (question: AssessmentQuestion) => {
    if (
      !window.confirm(
        `Excluir a pergunta "${question.prompt || "Sem enunciado"}"?`,
      )
    )
      return;
    commit({
      ...definition,
      questions: definition.questions.filter((item) => item.id !== question.id),
    });
  };

  const duplicateQuestion = (question: AssessmentQuestion) => {
    const copy = {
      ...question,
      id: newId("question"),
      prompt: question.prompt ? `${question.prompt} (cópia)` : "",
      options: question.options.map((option) => ({
        ...option,
        id: newId("option"),
      })),
    };
    const index = definition.questions.findIndex((item) => item.id === question.id);
    const questions = [...definition.questions];
    questions.splice(index + 1, 0, copy);
    commit({ ...definition, questions });
    setExpandedIds((current) => new Set([...current, copy.id]));
  };

  const toggleExpanded = (questionId: string) =>
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });

  return (
    <section className="space-y-4 rounded-2xl border border-[#E9E0E2] bg-[#FAF7F4] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-serif text-xl text-[#241A1D]">{title}</h4>
          <p className="mt-1 max-w-2xl text-sm text-[#776A6E]">{description}</p>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#641C32] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#7D2943]"
        >
          <CirclePlus size={18} /> Adicionar Nova Pergunta
        </button>
      </div>

      {showTitle && (
        <label className="block space-y-1.5 text-sm font-bold text-[#47393E]">
          <span>Título da avaliação</span>
          <input
            value={definition.title}
            maxLength={160}
            onChange={(event) =>
              commit({ ...definition, title: event.target.value })
            }
            className="w-full rounded-xl border border-[#E1D6D8] bg-white px-4 py-3 font-medium outline-none focus:border-[#8F3651]"
          />
        </label>
      )}

      {definition.questions.length === 0 ? (
        <button
          type="button"
          onClick={addQuestion}
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#CDBFC2] bg-white text-sm font-semibold text-[#776A6E] transition hover:border-[#8F3651] hover:text-[#641C32]"
        >
          <CirclePlus size={24} /> Nenhuma pergunta criada. Comece por aqui.
        </button>
      ) : (
        <div className="space-y-3">
          {definition.questions.map((question, index) => {
            const expanded = expandedIds.has(question.id);
            const correctCount = question.options.filter(
              (option) => option.correct,
            ).length;
            return (
              <article
                key={question.id}
                className="overflow-hidden rounded-2xl border border-[#E1D6D8] bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(question.id)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F5EFEC] text-xs font-black text-[#641C32]">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#241A1D]">
                        {question.prompt || "Pergunta sem enunciado"}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#8B7C81]">
                        {question.options.length} alternativas · {correctCount} correta(s)
                      </span>
                    </span>
                  </button>
                  <button type="button" aria-label="Mover pergunta para cima" disabled={index === 0}
                    onClick={() => moveQuestion(index, -1)} className="rounded-lg p-2 text-[#776A6E] hover:bg-[#F5EFEC] disabled:opacity-25"><ChevronUp size={17} /></button>
                  <button type="button" aria-label="Mover pergunta para baixo" disabled={index === definition.questions.length - 1}
                    onClick={() => moveQuestion(index, 1)} className="rounded-lg p-2 text-[#776A6E] hover:bg-[#F5EFEC] disabled:opacity-25"><ChevronDown size={17} /></button>
                  <button type="button" aria-label="Expandir ou recolher pergunta" onClick={() => toggleExpanded(question.id)}
                    className="rounded-lg p-2 text-[#641C32] hover:bg-[#F5EFEC]">{expanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</button>
                </div>

                {expanded && (
                  <div className="space-y-5 border-t border-[#EEE5E6] p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                      <label className="space-y-1.5 text-sm font-bold text-[#47393E]">
                        <span>Enunciado da pergunta</span>
                        <textarea value={question.prompt} maxLength={1000} rows={3}
                          onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, prompt: event.target.value }))}
                          className="w-full resize-y rounded-xl border border-[#E1D6D8] px-4 py-3 font-medium outline-none focus:border-[#8F3651]" />
                      </label>
                      <div className="space-y-4">
                        <label className="block space-y-1.5 text-sm font-bold text-[#47393E]">
                          <span>Tipo de pergunta</span>
                          <select value={question.type} onChange={(event) => {
                            const type = event.target.value as AssessmentQuestionType;
                            updateQuestion(question.id, (current) => {
                              const options = type === "boolean"
                                ? [
                                    { ...newOption("Verdadeiro"), correct: true },
                                    newOption("Falso"),
                                  ]
                                : current.options.map((option, optionIndex) => ({
                                    ...option,
                                    correct: type === "single" ? option.correct && optionIndex === current.options.findIndex((item) => item.correct) : option.correct,
                                  }));
                              return { ...current, type, options };
                            });
                          }} className="w-full rounded-xl border border-[#E1D6D8] bg-white px-3 py-3 outline-none focus:border-[#8F3651]">
                            <option value="single">Múltipla escolha</option>
                            <option value="multiple">Caixas de seleção</option>
                            <option value="boolean">Verdadeiro ou falso</option>
                          </select>
                        </label>
                        <label className="block space-y-1.5 text-sm font-bold text-[#47393E]">
                          <span>Categoria (opcional)</span>
                          <input value={question.category || ""} maxLength={120} placeholder="Ex.: Liderança"
                            onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, category: event.target.value }))}
                            className="w-full rounded-xl border border-[#E1D6D8] px-3 py-3 font-medium outline-none focus:border-[#8F3651]" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#47393E]">Alternativas</p>
                          <p className="text-xs text-[#8B7C81]">Marque a resposta correta ao lado de cada alternativa.</p>
                        </div>
                        {question.type !== "boolean" && (
                          <button type="button" onClick={() => updateQuestion(question.id, (current) => ({ ...current, options: [...current.options, newOption()] }))}
                            className="flex items-center gap-1.5 rounded-lg border border-[#D8CACC] px-3 py-2 text-xs font-bold text-[#641C32] hover:bg-[#F5EFEC]"><CirclePlus size={15} /> Adicionar alternativa</button>
                        )}
                      </div>
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="grid gap-2 rounded-xl border border-[#EEE5E6] bg-[#FCFAF9] p-3 md:grid-cols-[auto_1fr_auto]">
                          <label className="mt-2 flex items-center gap-2 text-xs font-bold text-[#641C32]">
                            <input type={question.type === "multiple" ? "checkbox" : "radio"}
                              name={`correct-${question.id}`} checked={option.correct}
                              onChange={() => updateQuestion(question.id, (current) => ({
                                ...current,
                                options: current.options.map((item) => ({
                                  ...item,
                                  correct: question.type === "multiple" ? item.id === option.id ? !item.correct : item.correct : item.id === option.id,
                                })),
                              }))} className="h-4 w-4 accent-[#641C32]" /> Correta
                          </label>
                          <div className="space-y-2">
                            <input value={option.label} maxLength={500} placeholder={`Alternativa ${optionIndex + 1}`}
                              onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, options: current.options.map((item) => item.id === option.id ? { ...item, label: event.target.value } : item) }))}
                              className="w-full rounded-lg border border-[#E1D6D8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8F3651]" />
                            <input value={option.feedback || ""} maxLength={1000} placeholder="Feedback/justificativa (opcional)"
                              onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, options: current.options.map((item) => item.id === option.id ? { ...item, feedback: event.target.value } : item) }))}
                              className="w-full rounded-lg border border-[#E1D6D8] bg-white px-3 py-2 text-xs outline-none focus:border-[#8F3651]" />
                          </div>
                          {question.type !== "boolean" && (
                            <button type="button" aria-label="Excluir alternativa" disabled={question.options.length <= 2}
                              onClick={() => updateQuestion(question.id, (current) => ({ ...current, options: current.options.filter((item) => item.id !== option.id) }))}
                              className="self-start rounded-lg p-2 text-[#9A596D] hover:bg-rose-50 disabled:opacity-25"><Trash2 size={17} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 border-t border-[#EEE5E6] pt-4">
                      <button type="button" onClick={() => duplicateQuestion(question)} className="flex items-center gap-2 rounded-lg border border-[#D8CACC] px-3 py-2 text-xs font-bold text-[#641C32] hover:bg-[#F5EFEC]"><Copy size={15} /> Duplicar</button>
                      <button type="button" onClick={() => removeQuestion(question)} className="flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 size={15} /> Excluir pergunta</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
