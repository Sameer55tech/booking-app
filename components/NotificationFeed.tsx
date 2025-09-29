"use client";
import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";
// Required CSS import, unless you're overriding the styling
import "@knocklabs/react/dist/index.css";
import { useRef, useState } from "react";

interface NotificationFeedProps {
  userId: string;
}

const NotificationFeed = (props: NotificationFeedProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_API_KEY}
      userId={props.userId}
    >
      {/* Optionally, use the KnockFeedProvider to connect an in-app feed */}
      <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_ID}>
        <div>
          <NotificationIconButton
            ref={notifButtonRef}
            onClick={(e) => setIsVisible(!isVisible)}
          />
          <NotificationFeedPopover
            buttonRef={notifButtonRef}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
        </div>
      </KnockFeedProvider>
    </KnockProvider>
  );
};

export default NotificationFeed;
