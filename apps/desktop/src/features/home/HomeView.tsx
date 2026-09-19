import React from "react";
import { SuggestionCard, SuggestedAction } from "./SuggestionCard.js";
import { useAgent } from "../agent/agent-context.js";
import { Sparkles } from "lucide-react";

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
  const { userProfile } = useAgent();

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 py-12 text-center select-none">
      {/* Brand pearl icon */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center text-accent mb-6 shadow-sm">
        <Sparkles className="w-6 h-6" />
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
