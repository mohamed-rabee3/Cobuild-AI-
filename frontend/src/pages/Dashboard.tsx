import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage";
import { UserProfile, Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Target, Sword, Rocket, FileCode, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import NewProjectModal from "@/components/modals/NewProjectModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    const savedProfile = storageService.getProfile();
    if (!savedProfile) {
      navigate("/");
      return;
    }
    setProfile(savedProfile);
    
    const savedProjects = storageService.getProjects();
    setProjects(savedProjects.sort((a, b) => b.lastModified - a.lastModified).slice(0, 5));
  }, [navigate]);

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case "python": return "🐍";
      case "javascript": return "⚡";
      case "cpp": return "⚙️";
      default: return "📝";
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cobuild AI</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.level === "beginner" ? "مبتدئ" : profile.level === "intermediate" ? "متوسط" : "متقدم"}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
              {profile.name[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Daily Challenges */}
          <div 
            className="group bg-gradient-card border border-border rounded-2xl p-8 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/challenges")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sword className="h-7 w-7 text-warning" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">التحديات اليومية</h2>
            <p className="text-muted-foreground mb-6">
              حل 3 مسائل اليوم واحصل على نقاط!
            </p>
            
            <Button variant="outline" className="w-full group-hover:bg-warning/10 group-hover:border-warning transition-colors">
              ابدأ التحدي →
            </Button>
          </div>

          {/* New Project */}
          <div 
            className="group bg-gradient-card border border-border rounded-2xl p-8 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            onClick={() => setShowNewProjectModal(true)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="h-7 w-7 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">مشروع جديد</h2>
            <p className="text-muted-foreground mb-6">
              ابنِ شيئاً مذهلاً مع مساعدة الذكاء الاصطناعي
            </p>
            
            <Button className="w-full group-hover:shadow-accent transition-all">
              إنشاء مشروع →
            </Button>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            المشاريع الأخيرة
          </h3>

          {projects.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                لا توجد مشاريع بعد. ابدأ بإنشاء أول مشروع لك!
              </p>
              <Button onClick={() => setShowNewProjectModal(true)} variant="outline">
                إنشاء مشروع
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="bg-card border border-border rounded-xl p-5 hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">
                        {getLanguageIcon(project.language)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{project.language === "python" ? "Python" : project.language === "javascript" ? "JavaScript" : "C++"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(project.lastModified, { 
                              locale: ar,
                              addSuffix: true 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {project.tasks.filter(t => t.completed).length} / {project.tasks.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <NewProjectModal open={showNewProjectModal} onOpenChange={setShowNewProjectModal} />
    </div>
  );
};

export default Dashboard;
