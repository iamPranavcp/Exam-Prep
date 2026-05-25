import { DashboardClient } from "@/components/dashboard-client";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const papers = await prisma.questionPaper.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      sections: { include: { questions: true } },
      attempts: { orderBy: { completedAt: "desc" }, take: 5 },
    },
  });

  return (
    <>
      <Topbar email={user.email} />
      <DashboardClient
        papers={papers.map((paper) => ({
          id: paper.id,
          title: paper.title,
          description: paper.description,
          updatedAt: paper.updatedAt.toISOString(),
          createdAt: paper.createdAt.toISOString(),
          sectionCount: paper.sections.length,
          questionCount: paper.sections.reduce((count, section) => count + section.questions.length, 0),
          attempts: paper.attempts.map((attempt) => ({
            id: attempt.id,
            score: attempt.score,
            correctCount: attempt.correctCount,
            wrongCount: attempt.wrongCount,
            skippedCount: attempt.skippedCount,
            completedAt: attempt.completedAt?.toISOString() ?? null,
          })),
        }))}
      />
    </>
  );
}
