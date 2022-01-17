import {answer} from '@/answer';
export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('dev only output');
  }
  return a + b;
};

export function addAnswer (x: number){
  return sum(x, answer);
}