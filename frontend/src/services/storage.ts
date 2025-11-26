import { UserProfile, Project, Challenge } from "@/types";

const STORAGE_KEYS = {
  PROFILE: "cobuild_profile",
  PROJECTS: "cobuild_projects",
  CHALLENGES: "cobuild_challenges",
} as const;

export const storageService = {
  // Profile
  getProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get profile:", error);
      return null;
    }
  },

  setProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error("Failed to save profile:", error);
      throw new Error("فشل حفظ البيانات. قد تكون مساحة التخزين ممتلئة.");
    }
  },

  // Projects
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get projects:", error);
      return [];
    }
  },

  setProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects:", error);
      throw new Error("فشل حفظ المشاريع. قد تكون مساحة التخزين ممتلئة.");
    }
  },

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = { ...project, lastModified: Date.now() };
    } else {
      projects.push(project);
    }

    this.setProjects(projects);
  },

  deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.setProjects(projects);
  },

  // Challenges
  getChallenges(): Challenge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      return data ? JSON.parse(data).challenges || [] : [];
    } catch (error) {
      console.error("Failed to get challenges:", error);
      return [];
    }
  },

  saveChallenges(challenges: Challenge[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CHALLENGES,
        JSON.stringify({ challenges })
      );
    } catch (error) {
      console.error("Failed to save challenges:", error);
      throw new Error("فشل حفظ التحديات. قد تكون مساحة التخزين ممتلئة.");
    }
  },

  addChallenges(newChallenges: Challenge[]): void {
    const challenges = this.getChallenges();
    const updated = [...newChallenges, ...challenges];
    this.saveChallenges(updated);
  },

  markChallengeSolved(challengeId: string): void {
    const challenges = this.getChallenges();
    const updated = challenges.map((c) =>
      c.id === challengeId ? { ...c, solved: true } : c
    );
    this.saveChallenges(updated);
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
