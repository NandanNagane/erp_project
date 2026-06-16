"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Loader2, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import logoImg from "@/assets/logo.png";
import loginBg from "@/assets/login_page_img.png";
import authApi from "@/lib/api/auth.api";
import axios from "axios";
import { useUser } from "@/lib/providers";

const loginSchema = z.object({
  username: z.string().min(1, "username is required."),
  password: z.string().min(4, "Password must be at least 4 characters."),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      // Call the backend login endpoint

      const response = await authApi.login(data);

      const result = response.data?.data;

      console.log("inside login page", result);

      setUser(result.user);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (err) {
      let message = "Invalid username or password.";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError("root.serverError", { message });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-zinc-900 font-sans">
      <div className="w-full md:w-[45%] lg:w-[40%] xl:w-[45%] flex flex-col justify-between p-8 md:p-12 relative min-h-screen bg-white">
        <div className="flex items-center gap-2 mb-12 md:mb-0 md:absolute md:top-8 md:left-8">
          <Image
            src={logoImg}
            alt="Production Planning Logo"
            width={182}
            height={182}
            className="object-contain"
            priority
          />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8">
            Log in to Production Planning
          </h1>

          {errors.root?.serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="font-semibold">Error:</span>{" "}
              {errors.root.serverError.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Controller
              name="username"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <input
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="Username"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-[#f4f4f5] border rounded-lg py-3 pl-4 pr-11 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 transition-all disabled:opacity-60 ${
                        fieldState.invalid
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-transparent focus:border-[#1565C0] focus:ring-[#1565C0]/20"
                      }`}
                    />
                    <Mail className="absolute right-3.5 text-zinc-400 size-5 pointer-events-none" />
                  </div>
                  {fieldState.invalid && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      {...field}
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      className={`w-full bg-[#f4f4f5] border rounded-lg py-3 pl-4 pr-11 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 transition-all disabled:opacity-60 ${
                        fieldState.invalid
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-transparent focus:border-[#1565C0] focus:ring-[#1565C0]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Lock className="size-5" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1565C0] hover:bg-[#0d47a1] active:bg-[#0a3070] text-white font-medium py-3 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1565C0] shadow-sm flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs mt-6">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-zinc-600 font-medium select-none cursor-pointer">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      className="rounded border-zinc-300 text-[#1565C0] focus:ring-[#1565C0] size-4 cursor-pointer disabled:opacity-60"
                    />
                    <span>Remember me</span>
                  </label>
                )}
              />
              <a
                href="#"
                className="text-zinc-900 font-bold hover:underline hover:text-[#1565C0]"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>

        <div className="mt-12 md:mt-0 text-center text-xs text-zinc-400 md:absolute md:bottom-8 md:left-0 md:right-0" />
      </div>

      <div className="hidden md:flex md:w-[55%] lg:w-[60%] xl:w-[55%] bg-gradient-to-br from-[#1e60d4] via-[#154db0] to-[#0d3680] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-black/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-[85%] max-h-[85%] flex items-center justify-center">
          <Image
            src={loginBg}
            alt="Production Planning Illustration"
            className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in"
            priority
          />
        </div>
      </div>
    </div>
  );
}
