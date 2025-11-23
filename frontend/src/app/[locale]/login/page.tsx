'use client';

import { Link, useRouter } from "@/lib/navigation";
import { useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { getZodFieldErrors } from "@/lib/form-utils";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    // Validate form with Zod
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(getZodFieldErrors<LoginFormData>(validation.error));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token } = response.data;

      setAuth(token);
      router.push('/dashboard');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-950">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left visual */}
        <div className="hidden md:flex bg-black items-center justify-center p-12">
          <img
            src="/images/spiral-1.svg"
            alt="visual"
            className="w-full h-full object-contain"
            style={{ maxHeight: 560 }}
          />
        </div>

        {/* Right form */}
        <div className="p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Welcome Back</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {apiError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }
                  if (apiError) setApiError('');
                }}
                className={`w-full rounded-lg border px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) {
                    const newErrors = { ...errors };
                    delete newErrors.password;
                    setErrors(newErrors);
                  }
                  if (apiError) setApiError('');
                }}
                className={`w-full rounded-lg border px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle forgot password
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href={`/${locale}/register`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
