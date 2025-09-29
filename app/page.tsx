"use client";
import CalEmbed from "@/components/CalEmbed";
import LoginButton from "@/components/LoginLogoutButton";
import NotificationFeed from "@/components/NotificationFeed";
import { Button } from "@/components/ui/button";
import UserGreetText from "@/components/UserGreetText";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-32">
        <UserGreetText />
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              router.push("/bookings");
            }}
          >
            My Bookings
          </Button>
        </div>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          {user && (
            <div className="mr-3">
              <NotificationFeed userId={user.id} />
            </div>
          )}
          <LoginButton />
        </div>
      </div>

      <div>
        <h1 className="font-bold text-4xl">Welcome to yoga classes</h1>
      </div>
      {user && (
        <div className="w-full h-[700px] text-center">
          <div>
            <h3 className="font-semibold text-2xl mt-4">
              Book your yoga session here
            </h3>
          </div>
          <div className="w-full h-[700px]">
            <CalEmbed
              userEmail={user?.email}
              userName={user?.user_metadata?.full_name}
            />
          </div>
        </div>
      )}
    </main>
  );
}
