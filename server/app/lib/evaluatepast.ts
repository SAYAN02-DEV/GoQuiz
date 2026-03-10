import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function pastEvaluate(attemptId: number){
    const attempt = await prisma.quiz_Attempt.findUnique({
        where:{
            attempt_id: attemptId
        },
        include: {
            answers:{
                include: {
                    question: {
                        include: {options: true}
                    },
                    selected_option:true,
                    mcq_selected_options:{
                        include: {option: true}
                    }
                }
            }
        }
    });
    let totalPoints = 0;
    for(const answer of attempt!.answers){
        const { question, selected_option, mcq_selected_options, integer_answer} = answer;
        if(question.question_type === 1){
            if(selected_option?.is_correct){
                totalPoints += question.correct_points;
            }else if(selected_option){
                totalPoints -= question.negative_points;
            }
        }else if(question.question_type === 2){
            const correctIds = question.options.filter( o => o.is_correct).map(o => o.option_id);
            const selectedIds = mcq_selected_options.map(s => s.option_id);
            const allCorrect = correctIds.every(id => selectedIds.includes(id));
            const noneWrong = selectedIds.every(id=> correctIds.includes(id));

            if(allCorrect && noneWrong){
                totalPoints += question.correct_points;
            }else if(selectedIds.length>0){
                totalPoints -= question.negative_points;
            }
        }else if(question.question_type === 3){
            if(integer_answer != null && integer_answer != undefined){
                if(integer_answer === question.correct_integer_answer){
                    totalPoints += question.correct_points;
                }else{
                    totalPoints -= question.negative_points;
                }
            }
        }
    }

    await prisma.quiz_Attempt.update({
        where: {attempt_id: attemptId},
        data: {points: totalPoints}
    });

    return totalPoints;
}