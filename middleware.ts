import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
  matcher: [
    "/users/:path*",
    "/list/:path*",
    "/settings/:path*",
    "/billing/:path*",
  ],
};
