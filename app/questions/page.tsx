'use client';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Flex } from 'antd';

export default function QuestionsPage() {
    const [questionList, setQuestionList] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        const { data } = await axios({
            method: 'GET',
            url: 'http://localhost:3000/api/questions',
        });
        setQuestionList(data);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
            <Flex
                gap={12}
                vertical>
                <Link href="/questions/new">Add new question</Link>
                {questionList.length > 1 ? (
                    questionList.map((q) => <div key={q.id}>{q?.stem}</div>)
                ) : (
                    <div>No questions found</div>
                )}
            </Flex>
        </>
    );
}
