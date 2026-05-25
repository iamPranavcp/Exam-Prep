"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PaperPayload } from "@/lib/paper-types";

type DraftOption = { text: string; isCorrect: boolean };
type DraftQuestion = { text: string; correctMark: number; wrongMark: number; optionCount: number; options: DraftOption[] };
type DraftSection = { name: string; topic: string; questions: DraftQuestion[] };

const emptyQuestion = (): DraftQuestion => ({
  text: "",
  correctMark: 1,
  wrongMark: 0,
  optionCount: 4,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
});

const emptySection = (): DraftSection => ({ name: "Section 1", topic: "General", questions: [emptyQuestion()] });

export function PaperEditor({ initialPaper }: { initialPaper?: PaperPayload & { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPaper?.title ?? "");
  const [description, setDescription] = useState(initialPaper?.description ?? "");
  const [sections, setSections] = useState<DraftSection[]>(initialPaper?.sections ?? [emptySection()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const questionCount = useMemo(() => sections.reduce((count, section) => count + section.questions.length, 0), [sections]);

  function updateQuestion(sectionIndex: number, questionIndex: number, patch: Partial<DraftQuestion>) {
    setSections((current) =>
      current.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              questions: section.questions.map((question, currentQuestionIndex) =>
                currentQuestionIndex === questionIndex ? { ...question, ...patch } : question,
              ),
            }
          : section,
      ),
    );
  }

  function setOptionCount(sectionIndex: number, questionIndex: number, optionCount: number) {
    const safeCount = Math.min(6, Math.max(2, optionCount));
    const question = sections[sectionIndex].questions[questionIndex];
    const options = [...question.options];
    while (options.length < safeCount) options.push({ text: "", isCorrect: false });
    updateQuestion(sectionIndex, questionIndex, { optionCount: safeCount, options: options.slice(0, safeCount) });
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload: PaperPayload = { title, description, sections };
    const response = await fetch(initialPaper ? `/api/papers/${initialPaper.id}` : "/api/papers", {
      method: initialPaper ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    const body = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;
    if (!response.ok) {
      setError(body?.error ?? "Unable to save question paper.");
      return;
    }
    router.push(`/papers/${body?.id ?? initialPaper?.id}/take`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">{initialPaper ? "Edit Question Paper" : "Create Question Paper"}</h1>
          <p className="text-sm text-muted-foreground">Build MCQ sections with per-question marks and negative marking.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Paper"}
        </Button>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Paper Details</CardTitle>
          <CardDescription>{questionCount} question{questionCount === 1 ? "" : "s"} in this paper</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input placeholder="Paper title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea placeholder="Short description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </CardContent>
      </Card>

      <div className="space-y-5">
        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input value={section.name} onChange={(event) => setSections((current) => current.map((item, index) => (index === sectionIndex ? { ...item, name: event.target.value } : item)))} />
                <Input value={section.topic} placeholder="Topic/category" onChange={(event) => setSections((current) => current.map((item, index) => (index === sectionIndex ? { ...item, topic: event.target.value } : item)))} />
                <Button variant="outline" onClick={() => setSections((current) => current.filter((_, index) => index !== sectionIndex))} disabled={sections.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-md border bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSections((current) => current.map((item, index) => index === sectionIndex ? { ...item, questions: item.questions.filter((_, qIndex) => qIndex !== questionIndex) } : item))} disabled={section.questions.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea className="mb-3 bg-white" placeholder="Question text" value={question.text} onChange={(event) => updateQuestion(sectionIndex, questionIndex, { text: event.target.value })} />
                  <div className="mb-3 grid gap-3 md:grid-cols-3">
                    <Input type="number" step="0.5" value={question.correctMark} onChange={(event) => updateQuestion(sectionIndex, questionIndex, { correctMark: Number(event.target.value) })} aria-label="Correct mark" />
                    <Input type="number" step="0.5" value={question.wrongMark} onChange={(event) => updateQuestion(sectionIndex, questionIndex, { wrongMark: Number(event.target.value) })} aria-label="Wrong mark" />
                    <Input type="number" min={2} max={6} value={question.optionCount} onChange={(event) => setOptionCount(sectionIndex, questionIndex, Number(event.target.value))} aria-label="Number of options" />
                  </div>
                  <div className="grid gap-2">
                    {question.options.slice(0, question.optionCount).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <button
                          type="button"
                          className={`grid h-10 w-10 place-items-center rounded-md border ${option.isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white text-slate-400"}`}
                          onClick={() =>
                            updateQuestion(sectionIndex, questionIndex, {
                              options: question.options.map((item, index) => ({ ...item, isCorrect: index === optionIndex })),
                            })
                          }
                          aria-label={`Mark option ${optionIndex + 1} correct`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <Input
                          className="bg-white"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(event) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              options: question.options.map((item, index) => (index === optionIndex ? { ...item, text: event.target.value } : item)),
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setSections((current) => current.map((item, index) => index === sectionIndex ? { ...item, questions: [...item.questions, emptyQuestion()] } : item))}>
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button className="mt-5" variant="secondary" onClick={() => setSections((current) => [...current, { ...emptySection(), name: `Section ${current.length + 1}` }])}>
        <Plus className="h-4 w-4" />
        Add Section
      </Button>
    </div>
  );
}
