import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";
import GuardiaSidebar from "@/components/guardia/GuardiaSidebar";
import GuardiaHeader from "@/components/guardia/GuardiaHeader";
import GuardiaProvider from "@/contexts/GuardiaContext";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

const GuardiaLayout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);

    const sidebarRef = useRef(null);

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <GuardiaProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
                <div
                    className={cn(
                        "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                        !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                    )}
                />
                <GuardiaSidebar
                    ref={sidebarRef}
                    collapsed={collapsed}
                />
                <div className={cn("transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
                    <GuardiaHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                    />
                    <main className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden">
                        <div className="max-w-7xl mx-auto p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </GuardiaProvider>
    );
};

export default GuardiaLayout;