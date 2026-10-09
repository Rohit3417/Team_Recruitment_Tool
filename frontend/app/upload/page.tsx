import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            File picker and upload preview arrive on Day 2. Connection to
            the real upload API and validation report arrive on Day 4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
