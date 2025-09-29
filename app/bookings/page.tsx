/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function BookingsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's bookings
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });
  console.log("Fetched bookings:", bookings, user);
  if (error) {
    console.error("Error fetching bookings:", error);
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings =
    bookings?.filter(
      (booking) =>
        new Date(booking.start_time) > now && booking.status !== "CANCELLED"
    ) || [];
  const pastBookings =
    bookings?.filter(
      (booking) =>
        new Date(booking.start_time) <= now || booking.status === "CANCELLED"
    ) || [];

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold">My Bookings</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Book New Session
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Sessions</h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-500">No upcoming bookings</p>
            <Link
              href="/"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Book your first session
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isUpcoming />
            ))}
          </div>
        )}
      </section>

      {/* Past Bookings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Past Sessions</h2>
        {pastBookings.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-500">No past bookings</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isUpcoming={false}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function BookingCard({
  booking,
  isUpcoming,
}: {
  booking: any;
  isUpcoming: boolean;
}) {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const statusColors = {
    ACCEPTED:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  return (
    <div className={`border rounded-lg p-6 ${!isUpcoming && "opacity-60"}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-xl">{booking.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[booking.status as keyof typeof statusColors] ||
            statusColors.PENDING
          }`}
        >
          {booking.status}
        </span>
      </div>

      {booking.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {booking.description}
        </p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {startTime.toLocaleDateString()} at{" "}
            {startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Duration:{" "}
            {Math.round((endTime.getTime() - startTime.getTime()) / 60000)}{" "}
            minutes
          </span>
        </div>

        {isUpcoming && (
          <div className="mt-4 pt-4 border-t text-gray-500">
            Starting {formatDistanceToNow(startTime, { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
}
