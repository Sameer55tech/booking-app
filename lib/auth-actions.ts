"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function sendLoginOTP(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create user if they don't exist
    },
  });

  if (error) {
    console.error("Login OTP error:", error);
    redirect("/error");
  }

  // Redirect to OTP verification page with email as query param
  redirect(`/verify-otp?email=${encodeURIComponent(email)}&type=login`);
}

// Send OTP to email for signup
export async function sendSignupOTP(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: `${firstName} ${lastName}`,
        email: email,
      },
    },
  });

  if (error) {
    console.error("Signup OTP error:", error);
    redirect("/error");
  }

  // Redirect to OTP verification page with email and user data
  redirect(
    `/verify-otp?email=${encodeURIComponent(
      email
    )}&type=signup&firstName=${encodeURIComponent(
      firstName
    )}&lastName=${encodeURIComponent(lastName)}`
  );
}

// Verify OTP code
export async function verifyOTP(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const type = formData.get("type") as string;

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("OTP verification error:", error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Resend OTP
export async function resendOTP(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const type = formData.get("type") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    shouldCreateUser: type === "signup",
  };

  if (type === "signup" && firstName && lastName) {
    options.data = {
      full_name: `${firstName} ${lastName}`,
      email: email,
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options,
  });

  if (error) {
    console.error("Resend OTP error:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}
