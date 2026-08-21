import LessonView from "@/components/learn/LessonView";
import { ALL_COURSES, courseLessons } from "@/lib/learn/registry";

// Every lesson of every course — see the note in ../page.tsx.
export function generateStaticParams() {
  return ALL_COURSES.flatMap((c) =>
    courseLessons(c).map((l) => ({ courseId: c.id, lessonId: l.id })),
  );
}

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  return <LessonView courseId={courseId} lessonId={lessonId} />;
}
