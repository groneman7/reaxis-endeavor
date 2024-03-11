import Link from 'next/link';
import { Button } from 'antd';
const dummyQuestions: any[] = [];

export default function QuestionsPage() {
  const questions = [...dummyQuestions];
  return (
    <>
      <Link href="/questions/new">Add new question</Link>
      <Button>Test button</Button>
      {questions.length > 1 ? (
        questions.map((q) => <div key={q?.key}>{q?.stem}</div>)
      ) : (
        <div>No questions found</div>
      )}
    </>
  );
}
