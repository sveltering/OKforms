import { z } from 'zod';

const User = z.object({
	email: z.string().email(),
	password: z.string().min(5)
});

console.log(User.shape.email.constructor.name);

export { User };
