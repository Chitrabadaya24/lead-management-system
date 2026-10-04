import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Login from './Login';

const renderLogin = (login) => render(
  <MemoryRouter><AuthContext.Provider value={{ user: null, login, register: vi.fn() }}><Login /></AuthContext.Provider></MemoryRouter>
);

describe('Login', () => {
  it('calls login with credentials', async () => {
    const login = vi.fn().mockResolvedValue({});
    renderLogin(login);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' });
  });
  it('shows server error message', async () => {
    renderLogin(vi.fn().mockRejectedValue({ response: { data: { message: 'Invalid email or password' } } }));
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
