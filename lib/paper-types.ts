export interface PaperOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface PaperQuestionInput {
  text: string;
  correctMark: number;
  wrongMark: number;
  optionCount: number;
  options: PaperOptionInput[];
}

export interface PaperSectionInput {
  name: string;
  topic: string;
  questions: PaperQuestionInput[];
}

export interface PaperPayload {
  title: string;
  description: string;
  sections: PaperSectionInput[];
}

export function sanitizePaperPayload(payload: PaperPayload) {
  const title = payload.title?.trim();
  if (!title) throw new Error("Question paper title is required.");

  const sections = (payload.sections ?? [])
    .map((section) => ({
      name: section.name?.trim() || "Untitled section",
      topic: section.topic?.trim() || "General",
      questions: (section.questions ?? [])
        .map((question) => {
          const text = question.text?.trim();
          const options = (question.options ?? [])
            .slice(0, Math.max(2, Number(question.optionCount) || 2))
            .map((option) => ({
              text: option.text?.trim(),
              isCorrect: Boolean(option.isCorrect),
            }))
            .filter((option) => option.text);

          if (!text || options.length < 2 || !options.some((option) => option.isCorrect)) return null;

          return {
            text,
            correctMark: Number.isFinite(Number(question.correctMark)) ? Number(question.correctMark) : 1,
            wrongMark: Number.isFinite(Number(question.wrongMark)) ? Number(question.wrongMark) : 0,
            optionCount: options.length,
            options,
          };
        })
        .filter(
          (
            question,
          ): question is {
            text: string;
            correctMark: number;
            wrongMark: number;
            optionCount: number;
            options: { text: string; isCorrect: boolean }[];
          } => question !== null,
        ),
    }))
    .filter((section) => section.questions.length > 0);

  if (sections.length === 0) throw new Error("Add at least one valid question with two options and a correct answer.");

  return {
    title,
    description: payload.description?.trim() ?? "",
    sections,
  };
}
