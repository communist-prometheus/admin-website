export declare const colors: {
    readonly light: {
        readonly background: "hsl(0, 0%, 100%)";
        readonly surface: "hsl(0, 0%, 98%)";
        readonly surfaceElevated: "hsl(0, 0%, 100%)";
        readonly textPrimary: "hsl(0, 0%, 13%)";
        readonly textSecondary: "hsl(0, 0%, 40%)";
        readonly border: "hsl(0, 0%, 90%)";
        readonly accent: "hsl(250, 84%, 54%)";
        readonly accentHover: "hsl(250, 84%, 48%)";
    };
    readonly dark: {
        readonly background: "hsl(0, 0%, 10%)";
        readonly surface: "hsl(0, 0%, 13%)";
        readonly surfaceElevated: "hsl(0, 0%, 16%)";
        readonly textPrimary: "hsl(0, 0%, 95%)";
        readonly textSecondary: "hsl(0, 0%, 65%)";
        readonly border: "hsl(0, 0%, 25%)";
        readonly accent: "hsl(250, 84%, 60%)";
        readonly accentHover: "hsl(250, 84%, 70%)";
    };
};
export type ColorScheme = typeof colors;
export type ThemeColors = ColorScheme['light'];
//# sourceMappingURL=colors.d.ts.map