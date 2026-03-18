import { Link } from "react-router-dom";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
}

const ToolHeader = ({ title, description, icon: Icon, iconColorClass }: ToolHeaderProps) => {
  return (
    <div className="mb-8">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          All Tools
        </Button>
      </Link>
      
      <div className="flex items-center gap-4">
        <div className={`tool-icon ${iconColorClass}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ToolHeader;
