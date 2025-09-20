import React, { useState } from 'react';
import { z } from 'zod';
import { useAuthStore } from './store';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm flex items-center justify-center animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-brand-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                        </svg>
                    </div>
                </div>

                <div className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
                            <p className="mt-1 text-sm text-slate-500">Sign in to continue to your dashboard</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={!!fieldErrors.email}
                                    placeholder="you@example.com"
                                />
                                {fieldErrors.email && <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <input
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={!!fieldErrors.password}
                                    placeholder="••••••••"
                                />
                                {fieldErrors.password && <div className="mt-1 text-xs text-red-600">{fieldErrors.password}</div>}
                            </div>

                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                className="relative inline-flex w-full items-center justify-center rounded-md bg-brand-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-300 disabled:opacity-60"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>Sign in</>
                                )}
                            </button>

                            <div className="flex items-center justify-between pt-1">
                                <a className="text-xs text-slate-500 hover:text-slate-700 transition" href="#">Forgot password?</a>
                                <span className="text-xs text-slate-400">v1.0</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


