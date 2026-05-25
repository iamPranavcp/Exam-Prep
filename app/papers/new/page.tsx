import { PaperEditor } from "@/components/paper-editor";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";

export default async function NewPaperPage() {
  const user = await requireUser();
  return (
    <>
      <Topbar email={user.email} />
      <PaperEditor />
    </>
  );
}
