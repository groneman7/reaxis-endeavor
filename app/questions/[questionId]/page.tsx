import QuestionForm from '@/app/components/Questions/QuestionForm';

type QuestionPageParams = {
    params: {
        questionId: string;
    };
};
export default function QuestionPage({ params }: QuestionPageParams) {
    return (
        <>
            <QuestionForm questionId={params.questionId} />
        </>
    );
}
