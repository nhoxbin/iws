'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Sprout, BookOpen, Settings2, User } from 'lucide-react';
import PrivateRoute from '@/components/private-route';

const roles = [
  {
    id: 'fresher',
    name: 'Fresher',
    description: 'Just starting out, eager to learn.',
    icon: Sprout,
  },
  {
    id: 'junior',
    name: 'Junior',
    description: 'Building foundations, need guidance.',
    icon: BookOpen,
  },
  {
    id: 'middle',
    name: 'Middle',
    description: 'Independent, scaling up skills.',
    icon: Settings2,
  },
  {
    id: 'senior',
    name: 'Senior',
    description: 'Expert, ready to mentor.',
    icon: User,
  },
];

function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/user/role', { role: selectedRole });
      updateUser({ role: selectedRole });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update role:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-white mb-16">
          Where are you in your journey?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-8 rounded-2xl border-2 transition-all text-left ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="w-12 h-12 mb-4 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">{role.name}</h3>
                  <p className="text-sm text-zinc-400">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium text-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Continue to Profile'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Onboarding() {
  return (
    <PrivateRoute>
      <OnboardingPage />
    </PrivateRoute>
  );
}
