import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireUser();
  const { paperId, answers } = (await request.json()) as {
    paperId?: string;
    answers?: Record<string, string | null>;
  };
  if (!paperId) return NextResponse.json({ error: "Paper id is required." }, { status: 400 });

  const paper = await prisma.questionPaper.findFirst({
    where: { id: paperId, ownerId: user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  if (!paper) return NextResponse.json({ error: "Question paper not found." }, { status: 404 });

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const answerRows = paper.sections.flatMap((section) =>
    section.questions.map((question) => {
      const selectedOptionId = answers?.[question.id] ?? null;
      const correctOption = question.options.find((option) => option.isCorrect);
      const isSkipped = !selectedOptionId;
      const isCorrect = Boolean(selectedOptionId && selectedOptionId === correctOption?.id);
      const marksAwarded = isSkipped ? 0 : isCorrect ? question.correctMark : question.wrongMark;
      score += marksAwarded;
      if (isSkipped) skippedCount += 1;
      else if (isCorrect) correctCount += 1;
      else wrongCount += 1;

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect,
        marksAwarded,
      };
    }),
  );

  const attempt = await prisma.testAttempt.create({
    data: {
      paperId: paper.id,
      userId: user.id,
      completedAt: new Date(),
      score,
      correctCount,
      wrongCount,
      skippedCount,
      answers: { create: answerRows },
    },
  });

  return NextResponse.json({ id: attempt.id });
}
