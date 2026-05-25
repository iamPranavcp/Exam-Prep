"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Play, RefreshCw, Search, SortDesc, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface DashboardPaper {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  sectionCount: number;
  questionCount: number;
  attempts: {
    id: string;
    score: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    completedAt: string | null;
  }[];
}

export function DashboardClient({ papers }: { papers: DashboardPaper[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "score">("updated");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const visiblePapers = useMemo(() => {
    const filtered = papers.filter((paper) => paper.title.toLowerCase().includes(query.toLowerCase()));
    return filtered.sort((a, b) => {
      if (sort === "score") return (b.attempts[0]?.score ?? -Infinity) - (a.attempts[0]?.score ?? -Infinity);
      return new Date(sort === "updated" ? b.updatedAt : b.createdAt).getTime() - new Date(sort === "updated" ? a.updatedAt : a.createdAt).getTime();
    });
  }, [papers, query, sort]);

  const groupedPapers = useMemo(() => {
    const now = Date.now();
    return visiblePapers.reduce<Record<string, DashboardPaper[]>>((groups, paper) => {
      const ageDays = (now - new Date(paper.updatedAt).getTime()) / 86_400_000;
      const group = ageDays < 1 ? "Today" : ageDays < 7 ? "This week" : "Earlier";
      groups[group] = [...(groups[group] ?? []), paper];
      return groups;
    }, {});
  }, [visiblePapers]);

  async function renamePaper(id: string) {
    await fetch(`/api/papers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: draftTitle }),
    });
    setRenamingId(null);
    router.refresh();
  }

  async function deletePaper(id: string) {
    if (!confirm("Delete this question paper and all attempts?")) return;
    await fetch(`/api/papers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Question Papers</h1>
          <p className="text-sm text-muted-foreground">Create, attend, reattempt, edit, rename, and sort your self-evaluation tests.</p>
        </div>
        <Button asChild>
          <Link href="/papers/new">Create New Question Paper</Link>
        </Button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search papers" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="flex gap-2">
          {(["updated", "created", "score"] as const).map((item) => (
            <Button key={item} variant={sort === item ? "default" : "outline"} onClick={() => setSort(item)}>
              <SortDesc className="h-4 w-4" />
              {item === "updated" ? "Updated" : item === "created" ? "Created" : "Score"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {(["Today", "This week", "Earlier"] as const).map((group) =>
          groupedPapers[group]?.length ? (
            <section key={group} className="grid gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">{group}</h2>
              {groupedPapers[group].map((paper) => {
                const lastAttempt = paper.attempts[0];
                return (
                  <Card key={paper.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    {renamingId === paper.id ? (
                      <div className="flex gap-2">
                        <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
                        <Button onClick={() => renamePaper(paper.id)}>Save</Button>
                      </div>
                    ) : (
                      <CardTitle>{paper.title}</CardTitle>
                    )}
                    <CardDescription>{paper.description || "No description added."}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{paper.sectionCount} sections</Badge>
                    <Badge>{paper.questionCount} questions</Badge>
                    <Badge>{paper.attempts.length} attempts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                  <span>Updated {formatDate(paper.updatedAt)}</span>
                  <span>{lastAttempt ? `Last score ${lastAttempt.score}` : "Not attended yet"}</span>
                  <span>{lastAttempt?.completedAt ? `Last attempt ${formatDate(lastAttempt.completedAt)}` : "Ready for first attempt"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/papers/${paper.id}/take`}>
                      <Play className="h-4 w-4" />
                      Attend
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/papers/${paper.id}/take`}>
                      <RefreshCw className="h-4 w-4" />
                      Reattempt
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/papers/${paper.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { setRenamingId(paper.id); setDraftTitle(paper.title); }}>
                    Rename
                  </Button>
                  <Button variant="destructive" onClick={() => deletePaper(paper.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  {lastAttempt ? (
                    <Button asChild variant="link">
                      <Link href={`/results/${lastAttempt.id}`}>View Result</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
                  </Card>
                );
              })}
            </section>
          ) : null,
        )}
        {visiblePapers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No question papers found. Create one to begin your exam preparation.</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
