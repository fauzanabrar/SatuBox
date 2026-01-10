import { getUserByUsername } from "@/lib/firebase/db/user";
import { getUserSession } from "@/lib/next-auth/user-session";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FormChangeEmail from "./form-change-email";
import FormChangePassword from "./form-change-password";
import FormEditUser from "./form-edit-user";
import FolderShare from "./folder-share";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userSession = await getUserSession();
  const userProfile = userSession?.username
    ? await getUserByUsername(userSession.username)
    : null;
  const currentEmail = userProfile?.email ?? "";
  const accordionItemClassName =
    "mt-4 first:mt-0 rounded-2xl border border-border/50 border-b-0 bg-background";
  const accordionTriggerClassName =
    "rounded-2xl px-5 py-4 hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/50";

  return (
    <div className="col-span-3 lg:col-span-4">
      <div className="h-full px-4 py-4 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Keep your most-used actions on top. Open a section only when you
            need it.
          </p>
        </div>
        <FolderShare />
        <div className="mt-8 max-w-xl rounded-2xl border bg-background p-4">
          <Accordion type="single" collapsible defaultValue="password">
            <AccordionItem value="password" className={accordionItemClassName}>
              <AccordionTrigger className={accordionTriggerClassName}>
                <div className="flex flex-col text-left">
                  <span>Change password</span>
                  <span className="text-xs text-muted-foreground">
                    Recommended for account security.
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <FormChangePassword />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="email" className={accordionItemClassName}>
              <AccordionTrigger className={accordionTriggerClassName}>
                <div className="flex flex-col text-left">
                  <span>Account email</span>
                  <span className="text-xs text-muted-foreground">
                    Used for recovery and product updates.
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <FormChangeEmail currentEmail={currentEmail} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="profile" className={accordionItemClassName}>
              <AccordionTrigger className={accordionTriggerClassName}>
                <div className="flex flex-col text-left">
                  <span>Profile name</span>
                  <span className="text-xs text-muted-foreground">
                    Update how your name appears.
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <FormEditUser
                    user={userSession}
                    hidden={[
                      "oldUsername",
                      "role",
                      "username",
                      "planId",
                      "billingCycle",
                    ]}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="appearance"
              className={accordionItemClassName}
            >
              <AccordionTrigger className={accordionTriggerClassName}>
                <div className="flex flex-col text-left">
                  <span>Appearance</span>
                  <span className="text-xs text-muted-foreground">
                    Switch between light and dark mode.
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Default is light.
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
