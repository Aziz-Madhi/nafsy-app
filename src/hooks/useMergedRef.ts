import { useCallback } from "react";

type CallbackRef<T> = (ref: T) => any;
type ObjectRef<T> = { current: T };

type Ref<T> = CallbackRef<T> | ObjectRef<T>;

export default function useMergedRef<T>(
  ...refs: (Ref<T> | undefined)[]
): CallbackRef<T> {
  return useCallback(
    (current: T) => {
      const refArray = [...refs];
      for (const ref of refArray) {
        if (ref != null) {
          if (typeof ref === "function") {
            ref(current);
          } else {
            ref.current = current;
          }
        }
      }
    },
    [refs]
  );
}
