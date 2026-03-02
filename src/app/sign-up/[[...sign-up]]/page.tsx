'use client';

import * as React from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  // Handle submission of basic signup form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the verification email code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Change the UI to our verification form
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  // Handle submission of verification form
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        /*  investigate the response, to see if there was an error
         or if the user needs to complete more steps.*/
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      }
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-vh-100 bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {pendingVerification ? 'Verify your email' : 'Create an Account'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {!pendingVerification ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
            >
              Sign Up
            </button>
            <div className="text-center mt-4">
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <a href="/sign-in" className="text-blue-600 hover:underline text-sm font-medium">Log In</a>
            </div>
          </form>
        ) : (
          <form onSubmit={onPressVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 text-center text-2xl tracking-widest font-mono"
                placeholder="123456"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
            >
              Verify OTP
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              A verification code has been sent to your email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
