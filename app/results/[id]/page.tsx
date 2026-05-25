import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const attempt = await prisma.testAttempt.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      paper: true,
      answers: {
        include: {
          selectedOption: true,
          question: { include: { options: { orderBy: { order: "asc" } }, section: true } },
        },
      },
    },
  });
  if (!attempt) notFound();

  const totalPossible = attempt.answers.reduce((total, answer) => total + answer.question.correctMark, 0);

  return (
    <>
      <Topbar email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal">Result: {attempt.paper.title}</h1>
            <p className="text-sm text-muted-foreground">Completed {attempt.completedAt ? formatDate(attempt.completedAt) : "just now"}</p>
          </div>
          <Button asChild>
            <Link href={`/papers/${attempt.paperId}/take`}>
              <RotateCcw className="h-4 w-4" />
              Reattempt Test
            </Link>
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card><CardHeader><CardTitle>Total Mark</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{attempt.score} / {totalPossible}</CardContent></Card>
          <Card><CardHeader><CardTitle>Correct</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-emerald-700">{attempt.correctCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>Wrong</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-red-700">{attempt.wrongCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>Skipped</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-slate-700">{attempt.skippedCount}</CardContent></Card>
        </div>

        <div className="space-y-4">
          {attempt.answers.map((answer, index) => {
            const correctOption = answer.question.options.find((option) => option.isCorrect);
            return (
              <Card key={answer.id}>
                <CardHeader>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <CardTitle className="text-base">Q{index + 1}. {answer.question.text}</CardTitle>
                    <Badge className={answer.selectedOptionId ? answer.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-slate-50 text-slate-700"}>
                      {answer.selectedOptionId ? answer.isCorrect ? "Correct" : "Wrong" : "Skipped"}: {answer.marksAwarded}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{answer.question.section.name} · {answer.question.section.topic}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Your answer: <span className="font-medium">{answer.selectedOption?.text ?? "Not answered"}</span></p>
                  <p>Correct answer: <span className="font-medium text-emerald-700">{correctOption?.text ?? "No correct option configured"}</span></p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
