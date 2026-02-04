"use client";

import { ColorModeProvider } from "@chakra-ui/color-mode";
import { SocketProvider } from "@/stores/socket";
import { AuthProvider } from "@/stores/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                <AuthProvider>
                    <SocketProvider>
                        <ColorModeProvider>
                            <Toaster />
                            {children}
                        </ColorModeProvider>
                    </SocketProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </QueryClientProvider>
    );
}

