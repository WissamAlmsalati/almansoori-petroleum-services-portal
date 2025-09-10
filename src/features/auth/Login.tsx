import React, { useState } from 'react';
import { z } from 'zod';
import { useAuthStore } from './store';

const inputClass = "w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonClass = "w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm disabled:opacity-60";

const schema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required')
});

export default function Login() {
    const { login, loading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setFieldErrors({});
        const parsed = schema.safeParse({ email, password });
        if (!parsed.success) {
            const errs: { email?: string; password?: string } = {};
            parsed.error.issues.forEach((i) => {
                if (i.path[0] === 'email') errs.email = i.message;
                if (i.path[0] === 'password') errs.password = i.message;
            });
            setFieldErrors(errs);
            return;
        }
        try {
            await login(email, password);
            // No hard redirect; App will re-render to the protected UI when auth store updates
        } catch (e) {
            // handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm bg-white shadow rounded p-6">
                <h1 className="text-lg font-semibold mb-4 text-slate-900">Sign in</h1>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1 text-slate-700">Email</label>
                        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldErrors.email} />
                        {fieldErrors.email && <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>}
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-slate-700">Password</label>
                        <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!fieldErrors.password} />
                        {fieldErrors.password && <div className="mt-1 text-xs text-red-600">{fieldErrors.password}</div>}
                    </div>
                    {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
                    <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
                </form>
            </div>
        </div>
    );
}


