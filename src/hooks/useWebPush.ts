"use client";

import { useState, useEffect } from "react";

export function useWebPush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      // Register service worker if not already
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported) return false;
    try {
      // 1. Kiểm tra VAPID Key
      let vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        alert("Lỗi: Thiếu NEXT_PUBLIC_VAPID_PUBLIC_KEY trên máy chủ.");
        return false;
      }
      vapidKey = vapidKey.trim(); // Loại bỏ khoảng trắng thừa
      
      // 2. Yêu cầu quyền gửi thông báo trước
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Bạn đã từ chối cấp quyền thông báo. Vui lòng vào Cài đặt trình duyệt để mở lại.");
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      
      // 3. Thực hiện đăng ký Push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // 4. Gửi sub lên backend
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Lỗi lưu đăng ký: " + (errorData.error || "Không xác định"));
        return false;
      }

      setIsSubscribed(true);
      setSubscription(sub);
      return true;
    } catch (e: any) {
      console.error(e);
      const keyInfo = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 
        `Độ dài Key: ${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length} ký tự. Bắt đầu bằng: ${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 10)}...` : 'Không có Key';
      alert(`Lỗi đăng ký Push: ${e.message}\n\nThông tin Debug:\n${keyInfo}\n\nHãy đảm bảo Key copy vào Vercel đúng chính xác 87 ký tự và không có khoảng trắng thừa!`);
      return false;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return false;
    try {
      await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      setIsSubscribed(false);
      setSubscription(null);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { isSupported, isSubscribed, subscribe, unsubscribe };
}
