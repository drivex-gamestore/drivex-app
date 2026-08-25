export function FormHoneypot() {
  return (
    <input
      type="text"
      name="website"
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] -z-10 h-px w-px overflow-hidden opacity-0"
    />
  );
}
