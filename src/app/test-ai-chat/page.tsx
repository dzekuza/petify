import AIChatCard from "@/components/ui/ai-chat";

export default function TestAIChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AIChatCard 
        providerName="Pet Paradise Grooming"
        className="w-full max-w-md"
      />
    </div>
  );
}
