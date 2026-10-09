import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ConfigurePage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Configure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full configuration UI arrives on Day 3. Saved configurations
            arrive on Day 5. &quot;Run evaluation&quot; button arrives on Day 7.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
