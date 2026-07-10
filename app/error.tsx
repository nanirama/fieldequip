"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-800">Something went wrong</h2>
            <p className="text-slate-500 max-w-md">
                We&apos;re sorry — an unexpected error occurred. Please try refreshing the page.
            </p>
            <button
                onClick={reset}
                className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
