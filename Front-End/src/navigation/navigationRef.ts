import { createNavigationContainerRef } from "@react-navigation/native";

// Ini memungkinkan untuk mengontrol navigasi dari file non-komponen (seperti api.ts)
export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
