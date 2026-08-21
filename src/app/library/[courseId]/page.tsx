import CourseView from "@/components/learn/CourseView";
import { ALL_COURSES } from "@/lib/learn/registry";

// Pre-render every course. Required for the static export used by the
// Capacitor (iOS/Android) build, and a prerender win for the web build.
export function generateStaticParams() {
  return ALL_COURSES.map((c) => ({ courseId: c.id }));
}

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseView courseId={courseId} />;
}
