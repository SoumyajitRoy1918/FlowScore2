import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface MagneticDockProps {
  items: DockItem[];
  className?: string;
}

const MouseContext = createContext({ x: 0, active: false });

function DockIcon({ item }: { item: DockItem }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const mouse = useContext(MouseContext);
  const distance = useMotionValue(Infinity);

  useEffect(() => {
    if (!ref.current || !mouse.active) {
      distance.set(Infinity);
      return;
    }

    const anchorRect = ref.current.getBoundingClientRect();
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    distance.set(Math.abs(mouse.x - anchorCenterX));
  }, [distance, mouse]);

  const width = useTransform(distance, [0, 120], [164, 128]);
  const translateY = useTransform(distance, [0, 120], [-6, 0]);
  const scale = useTransform(distance, [0, 120], [1.02, 1]);

  const springWidth = useSpring(width, { mass: 0.1, stiffness: 180, damping: 14 });
  const springY = useSpring(translateY, { mass: 0.1, stiffness: 180, damping: 14 });
  const springScale = useSpring(scale, { mass: 0.12, stiffness: 170, damping: 14 });

  const Icon = item.icon;

  return (
    <motion.div style={{ width: springWidth, y: springY, scale: springScale }} className="shrink-0">
      <NavLink
        ref={ref}
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex h-14 items-center justify-center gap-3 rounded-2xl border px-4 text-sm font-medium transition-colors",
            "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white",
            isActive && "border-white/15 bg-white text-slate-950 shadow-[0_16px_36px_-18px_rgba(255,255,255,0.65)]"
          )
        }
      >
        <Icon className="size-[18px]" />
        <span className="whitespace-nowrap">{item.label}</span>
      </NavLink>
    </motion.div>
  );
}

export default function MagneticDock({ items, className }: MagneticDockProps) {
  const [position, setPosition] = useState({ x: 0, active: false });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setPosition({ x: event.clientX, active: true });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, active: false });
  };

  return (
    <MouseContext.Provider value={position}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex w-fit items-center gap-3 rounded-[1.75rem] border border-white/10 bg-slate-900/72 p-2 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.95)] backdrop-blur-xl",
          className
        )}
      >
        {items.map((item) => (
          <DockIcon key={item.to} item={item} />
        ))}
      </div>
    </MouseContext.Provider>
  );
}
