import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  userEmail?: string;
  userName?: string;
}

export default function CalEmbed({ userEmail, userName }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
      if (userEmail) {
        cal("on", {
          action: "bookingSuccessful",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: (e: any) => {
            console.log("Booking successful!", e.detail);
          },
        });
      }
    })();
  }, [userEmail]);

  return (
    <Cal
      namespace="30min"
      calLink="sameer-ga9o70/30min"
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{
        layout: "month_view",
        theme: "auto",
        ...(userEmail && {
          email: userEmail,
          name: userName || "",
        }),
      }}
    />
  );
}
