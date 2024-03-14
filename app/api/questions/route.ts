import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/prisma/client';

const createQuestionSchema = z.object({
    stem: z.string().min(1),
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    const validation = createQuestionSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
        data: {
            stem: body.stem,
            choices: body.choices,
            summary: body.summary,
            explanation: body.explanation,
            type: body.type,
            correct_keys: body.correct_keys,
        },
    });

    return NextResponse.json(newQuestion, { status: 201 });
}

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        const allQuestions = await prisma.question.findMany();
        if (!allQuestions) {
            return NextResponse.json({ status: 404 });
        }
        return NextResponse.json(allQuestions, { status: 200 });
    }
    const question = await prisma.question.findUnique({ where: { id: id } });

    if (!question) {
        return NextResponse.json({ status: 404 });
    }
    return NextResponse.json(question, { status: 200 });
}
