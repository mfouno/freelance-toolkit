"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";

export function StoreInitializer() {
    const initStore = useAppStore(state => state.initStore);

    useEffect(() => {
        initStore();
    }, [initStore]);

    return null;
}
