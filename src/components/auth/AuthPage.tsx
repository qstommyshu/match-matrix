import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

export const AuthPage = () => {
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Match Matrix
        </h1>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {authMode === "signIn" ? <SignInForm /> : <SignUpForm />}

          <div className="mt-6 text-center">
            {authMode === "signIn" ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signUp")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signIn")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
