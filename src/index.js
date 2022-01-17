import { answer } from '@/answer';
export const sum = (a, b) => {
    if ('development' === process.env.NODE_ENV) {
        console.log('dev only output');
    }
    return a + b;
};
export function addAnswer(x) {
    return sum(x, answer);
}
