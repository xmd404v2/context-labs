import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

interface ContextDisplayProps {
  context: string;
  isLoading: boolean;
  onClose: () => void;
  position: {
    top: number;
    left: number;
  };
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({
  context,
  isLoading,
  onClose,
  position,
}) => {
  if (!context && !isLoading) return null;

  return (
    <div
      className="fixed z-50 max-w-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Card className="shadow-lg border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ContextRT</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onClose}
          >
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin h-5 w-5 border-2 border-slate-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">{context}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextDisplay; 