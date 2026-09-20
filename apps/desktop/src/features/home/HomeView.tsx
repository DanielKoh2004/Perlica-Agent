import React from "react";
import { SuggestionCard, SuggestedAction } from "./SuggestionCard.js";
import { useUserProfile } from "../profile/profile-context.js";

const DEFAULT_SUGGESTIONS: SuggestedAction[] = [
  {
    id: "sug-1",
    title: "Find something I'd enjoy",
    description: "Let Perlica review your taste and discover fresh media.",
    prompt: "Find something I would enjoy watching tonight based on my taste.",
  },
  {
    id: "sug-2",
    title: "Project debugging",
    description: "Audit codebase health and verify architectural boundaries.",
    prompt: "Help me debug issues and review component boundaries in my project.",
  },
  {
    id: "sug-3",
    title: "Continue where I left off",
    description: "Resume pending workflows and ongoing tasks seamlessly.",
    prompt: "What was I working on last, and what should we continue next?",
  },
  {
    id: "sug-4",
    title: "Research technical topic",
    description: "Synthesize insights and independently verify conclusions.",
    prompt: "Research desktop agent architectures with controlled OS capabilities.",
  },
];

interface HomeViewProps {
  onSelectSuggestion: (prompt: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectSuggestion }) => {
  const { userProfile } = useUserProfile();

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 py-12 text-center select-none">
      {/* Floating Perlica hero character - transparent background, no box container, enlarged hero size */}
      <div className="relative mb-3 group select-none flex items-center justify-center">
        <img
          src="/perlica_home_page.png"
          alt="Perlica"
          className="w-52 h-52 sm:w-64 sm:h-64 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover:scale-105 pointer-events-none"
        />
      </div>

      {/* Greeting hierarchy as specified in Frontend.md */}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground/95">
        Hi, {userProfile.name}
      </h1>

      <p className="text-base text-muted-foreground/80 mt-2 font-normal">
        How should Perlica help you today?
      </p>

      {/* Suggested action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
        {DEFAULT_SUGGESTIONS.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            action={suggestion}
            onSelect={onSelectSuggestion}
          />
        ))}
      </div>
    </div>
  );
};
