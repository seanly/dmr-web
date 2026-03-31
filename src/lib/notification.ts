let permissionRequested = false;

export function requestNotificationPermission(): void {
  if (permissionRequested) return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    permissionRequested = true;
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, body?: string): void {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // Only notify when the page is not focused
  if (document.hasFocus()) return;

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/icon.svg",
        tag: "dmr-approval",
      });
    });
  } else {
    new Notification(title, { body, icon: "/icon.svg", tag: "dmr-approval" });
  }
}
