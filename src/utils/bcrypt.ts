import bcrypt from 'bcrypt'

export const hashPassword = async (password: string) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
};

export const verifyPassword = async (inputPassword: string, hashPassword: string) => {
    return bcrypt.compare(inputPassword, hashPassword);
}