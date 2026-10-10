/**
 * Minimum password rule (specification 13.4 leaves it open; this is the
 * proposed default, recorded in the decision log): at least 8 characters with
 * at least one letter and one digit. No forced rotation, no history check (12.2).
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export function passwordError(password: string): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) return `A jelszó legalább ${PASSWORD_MIN_LENGTH} karakter legyen.`
  if (password.length > PASSWORD_MAX_LENGTH) return `A jelszó legfeljebb ${PASSWORD_MAX_LENGTH} karakter lehet.`
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return "A jelszó tartalmazzon betűt és számot is."
  return null
}
