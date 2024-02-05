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
            <div className="flex justify-start items-center gap-3">
              <Switch>
                <Match when={variant === "success"}>
                  <LucideCheck className="bg-green-500 p-1 text-white border rounded-2xl w-6 h-6" />
                </Match>
                <Match when={variant === "destructive"}>
                  <LucideX className="text-white text-md" />
                </Match>
                <Match when={variant === "warning"}>
                  <LucideAlertCircle className="bg-yellow-500 text-white border rounded-2xl w-8 h-8" />
                </Match>
              </Switch>
              <div className="grid gap-1 w-fit">
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
