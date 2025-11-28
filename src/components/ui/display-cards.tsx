"use client";

import { cn } from "@/lib/utils";
import { Clock, Users, FolderOpen } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Clock className="size-4 text-red-300" />,
  title = "Urenregistratie",
  description = "Eenvoudig uren bijhouden",
  date = "Nu",
  iconClassName = "text-red-500",
  titleClassName = "text-red-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-red-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-white after:to-transparent after:content-[''] hover:border-red-400/50 hover:bg-white [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-lg",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-block rounded-full bg-gradient-to-br from-red-500 to-rose-600 p-1.5", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-lg font-semibold", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-base text-gray-700">{description}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      icon: <Clock className="size-4 text-white" />,
      title: "Urenregistratie",
      description: "Eenvoudig uren bijhouden",
      date: "Direct starten",
      iconClassName: "bg-gradient-to-br from-red-500 to-rose-600",
      titleClassName: "text-red-600",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-red-200 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/30 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 animate-float-slow",
    },
    {
      icon: <Users className="size-4 text-white" />,
      title: "Team Management",
      description: "Beheer je medewerkers",
      date: "Altijd actueel",
      iconClassName: "bg-gradient-to-br from-violet-500 to-purple-600",
      titleClassName: "text-violet-600",
      className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-violet-200 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/30 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 animate-float-medium",
    },
    {
      icon: <FolderOpen className="size-4 text-white" />,
      title: "Projecten",
      description: "Overzicht van alle projecten",
      date: "Real-time updates",
      iconClassName: "bg-gradient-to-br from-rose-500 to-red-600",
      titleClassName: "text-rose-600",
      className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 animate-float-fast",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
