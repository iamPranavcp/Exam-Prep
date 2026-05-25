import { notFound } from "next/navigation";
import { TestRunner } from "@/components/test-runner";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TakePaperPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const paper = await prisma.questionPaper.findFirst({
    where: { id: params.id, ownerId: user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" }, select: { id: true, text: true } } },
          },
        },
      },
    },
  });
  if (!paper) notFound();

  return (
    <>
      <Topbar email={user.email} />
      <TestRunner
        paper={{
          id: paper.id,
          title: paper.title,
          description: paper.description,
          sections: paper.sections.map((section) => ({
            id: section.id,
            name: section.name,
            topic: section.topic,
            questions: section.questions.map((question) => ({
              id: question.id,
              text: question.text,
              correctMark: question.correctMark,
              wrongMark: question.wrongMark,
              options: question.options,
            })),
          })),
        }}
      />
    </>
  );
}
