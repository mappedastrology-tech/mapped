import FinalTestView from "@/components/learn/FinalTestView";
import { ALL_COURSES } from "@/lib/learn/registry";

// Final test for every course — see the note in ../page.tsx.
export function generateStaticParams() {
  return ALL_COURSES.map((c) => ({ courseId: c.id }));
}

export default async function FinalTestPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <FinalTestView courseId={courseId} />;
}
