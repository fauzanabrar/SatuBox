export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/user/:path*", "/list/:path*", "/settings/:path*"],
};
