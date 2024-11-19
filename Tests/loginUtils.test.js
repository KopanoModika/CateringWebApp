import { setupLoginForm } from 'login.html';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
}));

describe('setupLoginForm', () => {
    let auth;
    let showNotification, getErrorMessage;

    beforeEach(() => {
        // Mock Firebase Auth object
        auth = {};

        // Mock helper functions
        showNotification = jest.fn();
        getErrorMessage = jest.fn();

        // Setup DOM
        document.body.innerHTML = `
            <form id="loginForm">
                <input id="email" type="email" value="test@example.com" />
                <input id="password" type="password" value="password123" />
                <button type="submit">Login</button>
            </form>
        `;

        setupLoginForm(auth, showNotification, getErrorMessage);
    });

    it('should call signInWithEmailAndPassword with correct credentials', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

        const form = document.getElementById('loginForm');
        form.dispatchEvent(new Event('submit'));

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
        await new Promise(process.nextTick); // Wait for promises to resolve
        expect(showNotification).toHaveBeenCalledWith('Login successful!', true);
    });

    it('should show an error message on login failure', async () => {
        const error = { code: 'auth/wrong-password' };
        signInWithEmailAndPassword.mockRejectedValueOnce(error);
        getErrorMessage.mockReturnValue('Incorrect password.');

        const form = document.getElementById('loginForm');
        form.dispatchEvent(new Event('submit'));

        await new Promise(process.nextTick); // Wait for promises to resolve
        expect(getErrorMessage).toHaveBeenCalledWith('auth/wrong-password');
        expect(showNotification).toHaveBeenCalledWith('Error: Incorrect password.', false);
    });
});
