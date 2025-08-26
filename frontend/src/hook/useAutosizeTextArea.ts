import { useEffect } from "react";

export function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) {
  useEffect(() => {
    if (!textAreaRef) return;
    textAreaRef.style.height = "auto"; // reset ก่อน
    textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
  }, [textAreaRef, value]); // ทำงานทุกครั้งที่ value เปลี่ยน
}
