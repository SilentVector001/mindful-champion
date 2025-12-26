'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoAnalysisResultsProps {
  analysisId?: string;
  videoId?: string;
  analysis?: any;
}

export default function VideoAnalysisResults({ analysisId, analysis }: VideoAnalysisResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Analysis ID: {analysisId}</p>
        {analysis && <pre>{JSON.stringify(analysis, null, 2)}</pre>}
      </CardContent>
    </Card>
  );
}
