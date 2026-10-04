import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadForm, { validate } from './LeadForm';

describe('LeadForm', () => {
  it('shows required-field errors and does not submit when empty', async () => {
    const onSubmit = vi.fn();
    render(<LeadForm users={[]} isAdmin={false} onSubmit={onSubmit} onCancel={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /save lead/i }));
    expect(screen.getByText('Lead name is required')).toBeInTheDocument();
    expect(screen.getByText('Contact number is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('submits valid data and reveals customer fields after conversion', async () => {
    const onSubmit = vi.fn();
    render(<LeadForm users={[]} isAdmin={false} onSubmit={onSubmit} onCancel={() => {}} />);
    await userEvent.type(screen.getByLabelText(/lead name/i), 'Asha');
    await userEvent.type(screen.getByLabelText(/contact number/i), '9876543210');
    await userEvent.selectOptions(screen.getByLabelText(/^status/i), 'converted');
    expect(screen.getByLabelText(/medical needs/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /save lead/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ leadName: 'Asha', status: 'converted' }));
  });
  it('validate() rejects bad phone numbers', () => {
    expect(validate({ leadName: 'x', contactNumber: 'abc', email: '', status: 'new', purchaseHistory: [] }).contactNumber).toMatch(/valid/);
  });
});
