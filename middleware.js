import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
});

export const config = {
  matcher: [
    "/",
    "/(fr|en|ar)/:path*",
    "/((?!api|_next|admin|.*\\..*).*)",
  ],
};