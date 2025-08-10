import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Target } from "lucide-react";
import { READING_STATUS_LABELS, ReadingStatus } from "@/types/api";

interface ProgressTrackerProps {
  bookTitle: string;
  currentProgress: number;
  readingStatus: ReadingStatus;
  startedAt?: string;
  onProgressUpdate: (progress: number) => void;
  onStatusUpdate: (status: ReadingStatus) => void;
}

export function ProgressTracker({
  bookTitle,
  currentProgress,
  readingStatus,
  startedAt,
  onProgressUpdate,
  onStatusUpdate
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState(currentProgress);

  const handleProgressChange = (values: number[]) => {
    const newProgress = values[0];
    setProgress(newProgress);
    onProgressUpdate(newProgress);
    
    // Auto-update status based on progress
    if (newProgress === 0 && readingStatus !== 0) {
      onStatusUpdate(0); // To Read
    } else if (newProgress > 0 && newProgress < 100 && readingStatus !== 1) {
      onStatusUpdate(1); // In Progress
    } else if (newProgress === 100 && readingStatus !== 2) {
      onStatusUpdate(2); // Completed
    }
  };

  const getStatusColor = (status: ReadingStatus) => {
    switch (status) {
      case 0: return "outline"; // To Read
      case 1: return "default"; // Reading
      case 2: return "secondary"; // Completed
      case 3: return "destructive"; // Dropped
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{bookTitle}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusColor(readingStatus)}>
                {READING_STATUS_LABELS[readingStatus]}
              </Badge>
              {startedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Started {new Date(startedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progress}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reading Progress</span>
              <span className="text-sm text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Update Progress</label>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(1)}
              disabled={readingStatus === 1}
              className="flex-1"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Mark Reading
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setProgress(100);
                onProgressUpdate(100);
                onStatusUpdate(2);
              }}
              disabled={readingStatus === 2}
              className="flex-1"
            >
              <Target className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}