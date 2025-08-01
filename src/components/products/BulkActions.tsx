
import { Edit, Trash2, Archive, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onBulkStatusChange,
}: BulkActionsProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {selectedCount} products selected
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onBulkEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>

            <Select onValueChange={onBulkStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Set Active
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center">
                    <Archive className="h-4 w-4 mr-2" />
                    Set Inactive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onBulkDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
