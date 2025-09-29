/* eslint-disable @typescript-eslint/no-explicit-any */
import { triggerNotification } from "@/lib/knock";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! 
);

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-cal-signature-256") || "";

    // Verify webhook signature
    if (!verifySignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(payload);
    const { triggerEvent, payload: bookingData } = data;

    console.log("Cal.com webhook received:", triggerEvent, bookingData);

    // Find user by email
    const { data: userData, error: userError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", bookingData.attendees[0]?.email)
      .single();

    console.log("userData:", userData, userError);
    if (userError || !userData) {
      console.error("User not found:", bookingData.attendees[0]?.email);
      // Still return 200 to acknowledge webhook
      return NextResponse.json({
        received: true,
        message: "User not found, booking not stored",
      });
    }

    // Handle different webhook events
    switch (triggerEvent) {
      case "BOOKING_CREATED":
        await handleBookingCreated(bookingData, userData.id);
        break;
      case "BOOKING_RESCHEDULED":
        await handleBookingRescheduled(bookingData);
        break;
      case "BOOKING_CANCELLED":
        await handleBookingCancelled(bookingData);
        break;
      default:
        console.log("Unhandled event type:", triggerEvent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleBookingCreated(bookingData: any, userId: string) {
  const { error } = await adminSupabase.from("bookings").insert({
    user_id: userId,
    cal_booking_id: bookingData.uid,
    event_type_id: bookingData.eventTypeId?.toString(),
    title: bookingData.title,
    description: bookingData.description,
    start_time: bookingData.startTime,
    end_time: bookingData.endTime,
    attendee_name: bookingData.attendees[0]?.name,
    attendee_email: bookingData.attendees[0]?.email,
    attendee_timezone: bookingData.attendees[0]?.timeZone,
    status: bookingData.status,
    metadata: bookingData,
  });

  if (error) {
    console.error("Error creating booking:", error);
    throw error;
  }

  await triggerNotification({
    id: userId,
    name: bookingData.attendees[0]?.name,
    email: bookingData.attendees[0]?.email,
  });

  console.log("Booking created successfully:", bookingData.uid);
}

async function handleBookingRescheduled(bookingData: any) {
  const calBookingId = bookingData.iCalUID?.split("@")[0];

  const { error } = await adminSupabase
    .from("bookings")
    .update({
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      status: bookingData.status,
      metadata: bookingData,
      updated_at: new Date().toISOString(),
    })
    .eq("cal_booking_id", calBookingId);

  if (error) {
    console.error("Error rescheduling booking:", error);
    throw error;
  }

  console.log("Booking rescheduled successfully:", calBookingId);
}

async function handleBookingCancelled(bookingData: any) {
  const calBookingId = bookingData.iCalUID?.split("@")[0];
  const { error } = await adminSupabase
    .from("bookings")
    .update({
      status: "CANCELLED",
      updated_at: new Date().toISOString(),
    })
    .eq("cal_booking_id", calBookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }

  console.log("Booking cancelled successfully:", calBookingId);
}
