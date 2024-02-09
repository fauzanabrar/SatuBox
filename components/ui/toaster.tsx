"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import Switch from "@/components/switch";
import Match from "@/components/match";
import { LucideAlertCircle, LucideCheck, LucideX } from "lucide-react";

export default function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        variant,
        title,
        description,
        action,
        ...props
      }) {
        return (
          <Toast className="md:w-fit" key={id} variant={variant} {...props}>
            <div className="flex items-center justify-start gap-3">
              <Switch>
                <Match when={variant === "success"}>
                  <LucideCheck className="h-6 w-6 rounded-2xl border bg-green-500 p-1 text-white" />
                </Match>
                <Match when={variant === "destructive"}>
                  <LucideX className="text-md text-white" />
                </Match>
                <Match when={variant === "warning"}>
                  <LucideAlertCircle className="h-8 w-8 rounded-2xl border bg-yellow-500 text-white" />
                </Match>
              </Switch>
              <div className="grid w-fit gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
