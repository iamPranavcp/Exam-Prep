import { notFound } from "next/navigation";
import { PaperEditor } from "@/components/paper-editor";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EditPaperPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const paper = await prisma.questionPaper.findFirst({
    where: { id: params.id, ownerId: user.id },
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
  if (!paper) notFound();

  return (
    <>
      <Topbar email={user.email} />
      <PaperEditor
        initialPaper={{
          id: paper.id,
          title: paper.title,
          description: paper.description,
          sections: paper.sections.map((section) => ({
            name: section.name,
            topic: section.topic,
            questions: section.questions.map((question) => ({
              text: question.text,
              correctMark: question.correctMark,
              wrongMark: question.wrongMark,
              optionCount: question.optionCount,
              options: question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })),
            })),
          })),
        }}
      />
    </>
  );
}
