"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TestPaper {
  id: string;
  title: string;
  description: string;
  sections: {
    id: string;
    name: string;
    topic: string;
    questions: {
      id: string;
      text: string;
      correctMark: number;
      wrongMark: number;
      options: { id: string; text: string }[];
    }[];
  }[];
}

export function TestRunner({ paper }: { paper: TestPaper }) {
  const router = useRouter();
  const questions = useMemo(() => paper.sections.flatMap((section) => section.questions.map((question) => ({ ...question, sectionName: section.name }))), [paper]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const answeredCount = Object.keys(answers).length;

  async function submit() {
    if (!confirm(`Submit test with ${answeredCount} answered and ${questions.length - answeredCount} skipped?`)) return;
    setSubmitting(true);
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId: paper.id, answers }),
    });
    const body = (await response.json()) as { id?: string };
    setSubmitting(false);
    if (body.id) router.push(`/results/${body.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">{paper.title}</h1>
          <p className="text-sm text-muted-foreground">{paper.description || "Self-evaluation test"}</p>
        </div>
        <div className="flex gap-2">
          <Badge>{answeredCount} answered</Badge>
          <Badge>{questions.length - answeredCount} skipped</Badge>
        </div>
      </div>

      <div className="space-y-5">
        {paper.sections.map((section) => (
          <section key={section.id}>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">{section.name}</h2>
              <p className="text-sm text-muted-foreground">{section.topic}</p>
            </div>
            <div className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-base">Q{questionIndex + 1}. {question.text}</CardTitle>
                    <CardDescription>Correct: {question.correctMark} mark | Wrong: {question.wrongMark} mark</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option.id}
                        className={`rounded-md border px-4 py-3 text-left text-sm transition ${answers[question.id] === option.id ? "border-orange-500 bg-orange-50 text-orange-900" : "bg-white hover:bg-slate-50"}`}
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                      >
                        <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                        {option.text}
                      </button>
                    ))}
                    {answers[question.id] ? (
                      <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => setAnswers((current) => {
                        const copy = { ...current };
                        delete copy[question.id];
                        return copy;
                      })}>
                        Clear answer
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="sticky bottom-0 mt-6 flex justify-end border-t bg-background/95 py-4 backdrop-blur">
        <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Test"}</Button>
      </div>
    </div>
  );
}
