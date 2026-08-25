import { createRef } from "react";
import { RollerNumber } from "@animations/components/RollerNumber"; 

function parseNumber(value) {
  const match = value.trim().match(/^([€$£¥₹]?[-+]?)(\d+)([MBKx%+]*)$/i);
  if (!match) return null;
  const [, prefix = "", number = "", suffix = ""] = match;
  return {
    prefix,
    number: Number.parseInt(number, 10),
    suffix,
  };
}

function StatsComponentClient({ items }) {
  const refs = items.map(() => createRef());

  return (
    <div className="flex flex-row flex-wrap gap-64">
      {items.map((item, index) => {
        const parsed = parseNumber(item.number);
        return (
          <div key={item._key} ref={refs[index]}>
            <div className="flex items-center font-light text-h2">
              {parsed ? (
                <>
                  {parsed.prefix}
                  <RollerNumber
                    value={parsed.number}
                    minDigits={parsed.number.toString().length}
                    triggerMode="scroll"
                    triggerElement={refs[index]}
                    duration={2}
                    stagger={0.1}
                    suffix={parsed.suffix}
                  />
                </>
              ) : (
                item.number
              )}
            </div>
            <p className="text-accent-sm text-foreground-muted">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export { StatsComponentClient };
