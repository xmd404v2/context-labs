import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">ContextRT</CardTitle>
          <CardDescription>
            Get real-time context as you type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This extension analyzes your text as you type and provides relevant context using AI.
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
              <h3 className="font-medium text-sm mb-2">How it works:</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Type in any text field on the web</li>
                <li>The extension analyzes your text</li>
                <li>See contextual information appear near your cursor</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Settings</Button>
          <Button>Learn More</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
