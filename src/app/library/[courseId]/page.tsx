import CourseView from "@/components/learn/CourseView";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseView courseId={courseId} />;
}
