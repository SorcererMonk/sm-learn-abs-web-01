/**
 * One validation schema, two runtimes: the browser imports it for instant feedback and the
 * server imports it as the authority. The server adds what only it can know (is the email taken?).
 */
export interface SignupInput {
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'team';
  terms: boolean;
}

export type SignupField = keyof SignupInput;
export type SignupErrors = Partial<Record<SignupField, string>>;

export const PLANS = ['free', 'pro', 'team'] as const;
const BREACHED = new Set(['password123', 'qwertyuiop', '1234567890', 'letmein123', 'iloveyou12']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Validation =
  | { ok: true; value: SignupInput }
  | { ok: false; errors: SignupErrors; values: Record<string, string> };

/** Validates untrusted input (form fields or JSON) into a typed value or per-field messages. */
export function validateSignup(input: Record<string, unknown>): Validation {
  const text = (key: string): string =>
    typeof input[key] === 'string' ? (input[key] as string).trim() : '';
  const values = { name: text('name'), email: text('email').toLowerCase(), plan: text('plan') };
  const password = typeof input.password === 'string' ? input.password : '';
  const terms = input.terms === true || input.terms === 'on' || input.terms === 'true';
  const errors: SignupErrors = {};
  if (!values.name) errors.name = 'Enter your name';
  else if (values.name.length > 60) errors.name = 'Name must be 60 characters or fewer';
  if (!values.email) errors.email = 'Enter your email address';
  else if (!EMAIL.test(values.email)) errors.email = 'Enter an email address like name@example.com';
  if (password.length < 10) errors.password = 'Password must be at least 10 characters';
  else if (BREACHED.has(password.toLowerCase()))
    errors.password = 'That password appears in breach lists; choose another';
  if (!PLANS.includes(values.plan as SignupInput['plan'])) errors.plan = 'Choose a plan';
  if (!terms) errors.terms = 'Accept the terms to continue';
  if (Object.keys(errors).length) return { ok: false, errors, values };
  return {
    ok: true,
    value: { ...values, password, plan: values.plan as SignupInput['plan'], terms },
  };
}

export const FIELD_ORDER: SignupField[] = ['name', 'email', 'password', 'plan', 'terms'];
