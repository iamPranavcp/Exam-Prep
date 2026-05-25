import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizePaperPayload, type PaperPayload } from "@/lib/paper-types";

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const payload = sanitizePaperPayload((await request.json()) as PaperPayload);
    const paper = await prisma.questionPaper.create({
      data: {
        title: payload.title,
        description: payload.description,
        ownerId: user.id,
        sections: {
          create: payload.sections.map((section, sectionIndex) => ({
            name: section.name,
            topic: section.topic,
            order: sectionIndex,
            questions: {
              create: section.questions.map((question, questionIndex) => ({
                text: question.text,
                correctMark: question.correctMark,
                wrongMark: question.wrongMark,
                optionCount: question.optionCount,
                order: questionIndex,
                options: {
                  create: question.options.map((option, optionIndex) => ({
                    text: option.text,
                    isCorrect: option.isCorrect,
                    order: optionIndex,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
    return NextResponse.json({ id: paper.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create paper." }, { status: 400 });
  }
}
