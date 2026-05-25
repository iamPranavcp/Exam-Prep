import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizePaperPayload, type PaperPayload } from "@/lib/paper-types";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const existing = await prisma.questionPaper.findFirst({ where: { id: params.id, ownerId: user.id } });
  if (!existing) return NextResponse.json({ error: "Question paper not found." }, { status: 404 });

  try {
    const payload = sanitizePaperPayload((await request.json()) as PaperPayload);
    await prisma.$transaction([
      prisma.testAttempt.deleteMany({ where: { paperId: params.id } }),
      prisma.questionPaper.update({
        where: { id: params.id },
        data: { title: payload.title, description: payload.description },
      }),
      prisma.section.deleteMany({ where: { paperId: params.id } }),
    ]);
    await prisma.questionPaper.update({
      where: { id: params.id },
      data: {
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
    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update paper." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const { title } = (await request.json()) as { title?: string };
  const cleanTitle = title?.trim();
  if (!cleanTitle) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const paper = await prisma.questionPaper.findFirst({ where: { id: params.id, ownerId: user.id } });
  if (!paper) return NextResponse.json({ error: "Question paper not found." }, { status: 404 });

  await prisma.questionPaper.update({ where: { id: params.id }, data: { title: cleanTitle } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const paper = await prisma.questionPaper.findFirst({ where: { id: params.id, ownerId: user.id } });
  if (!paper) return NextResponse.json({ error: "Question paper not found." }, { status: 404 });

  await prisma.questionPaper.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
