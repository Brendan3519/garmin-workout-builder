"use client";

import { useEffect } from "react";
import posthog from 'posthog-js';

export default function PostHogProvider({children}: {children: React.ReactNode}) {
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: 'identified_only',
        });
    }, []);

    return <>{children}</>;
}