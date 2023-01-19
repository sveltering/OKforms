import { okform } from '$lib';
import { z } from 'zod';

const numbers = ['ONE', 'TWO', 'THREE'] as const;
const SignUp = z.object({
	username: z.string().min(5),
	email: z.string().email(),
	password: z.string().min(6),
	number: z.enum(numbers).or(z.array(z.enum(numbers)))
});
type SignUp = z.infer<typeof SignUp>;

export const testForm = okform<SignUp>('test').zod(SignUp);
export type { SignUp };
