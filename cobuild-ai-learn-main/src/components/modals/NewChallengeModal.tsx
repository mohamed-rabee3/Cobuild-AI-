import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface NewChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChallengeModal = ({ open, onOpenChange }: NewChallengeModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    // Mock creation - in real app, save to storage or backend
    toast.success("تم إنشاء التحدي بنجاح! 🎉");
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setDifficulty("easy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>⚔️ إنشاء تحدي جديد</DialogTitle>
          <DialogDescription>
            أنشئ تحدياً برمجياً جديداً للمستخدمين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان التحدي</Label>
            <Input
              id="title"
              placeholder="مثال: حساب مجموع رقمين"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً واضحاً للمسألة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">مستوى الصعوبة</Label>
            <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🟢 سهل</SelectItem>
                <SelectItem value="medium">🟡 متوسط</SelectItem>
                <SelectItem value="hard">🔴 صعب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleCreate}
            className="flex-1"
            disabled={!title.trim() || !description.trim()}
          >
            إنشاء التحدي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChallengeModal;
