"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = void 0;
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
const sonner_1 = require("sonner");
const Toaster = ({ ...props }) => {
    const { theme = "system" } = (0, next_themes_1.useTheme)();
    return (<sonner_1.Toaster theme={theme} className="toaster group" icons={{
            success: <lucide_react_1.CircleCheck className="h-4 w-4"/>,
            info: <lucide_react_1.Info className="h-4 w-4"/>,
            warning: <lucide_react_1.TriangleAlert className="h-4 w-4"/>,
            error: <lucide_react_1.OctagonX className="h-4 w-4"/>,
            loading: <lucide_react_1.LoaderCircle className="h-4 w-4 animate-spin"/>,
        }} toastOptions={{
            classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
        }} {...props}/>);
};
exports.Toaster = Toaster;
//# sourceMappingURL=sonner.js.map