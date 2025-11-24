import axios from "axios";
import { PistonRequest, PistonResponse } from "@/types";

const PISTON_API = "https://emkc.org/api/v2/piston";

export const pistonService = {
  async execute(
    code: string,
    language: string,
    inputs: string[] = []
  ): Promise<PistonResponse> {
    const payload: PistonRequest = {
      language: language,
      version: "*",
      files: [
        {
          name: language === "python" ? "main.py" : language === "javascript" ? "main.js" : "main.cpp",
          content: code,
        },
      ],
      stdin: inputs.join("\n"),
      compile_timeout: 10000,
      run_timeout: 5000,
    };

    try {
      const response = await axios.post(`${PISTON_API}/execute`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "فشل تشغيل الكود. تحقق من الاتصال بالإنترنت."
        );
      }
      throw error;
    }
  },

  async getSupportedLanguages() {
    try {
      const response = await axios.get(`${PISTON_API}/runtimes`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch supported languages:", error);
      return [];
    }
  },
};
