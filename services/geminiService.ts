import { GoogleGenAI } from "@google/genai";

export const askMedicalAssistant = async (prompt: string, context: string): Promise<string> => {
  // Always use process.env.API_KEY directly when initializing the client.
  // We assume the API key is pre-configured and accessible.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const systemPrompt = `
      你是一位专业的胃癌专科医生和健康科普专家。
      你的任务是用通俗易懂、温暖且严谨的语言回答患者关于胃癌的问题。
      
      当前上下文: ${context}
      
      请遵循以下原则：
      1. 解释医学术语时要打比方。
      2. 语气要积极、给人希望，同时不隐瞒事实。
      3. 回答要条理清晰，分点说明。
      4. 针对"胃癌"相关问题进行深度解答。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n用户问题: ${prompt}`,
    });

    return response.text || "抱歉，我现在无法回答这个问题，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络连接出现问题，请检查您的网络或稍后重试。";
  }
};

export const generateEducationalVideo = async (prompt: string): Promise<string> => {
  try {
    const win = window as any;
    console.log("Starting medical video generation process...");

    // 1. Ensure user has selected a paid API key for Veo
    if (win.aistudio && typeof win.aistudio.hasSelectedApiKey === 'function') {
      if (!(await win.aistudio.hasSelectedApiKey())) {
        console.log("Requesting API Key selection for Veo...");
        await win.aistudio.openSelectKey();
        
        // Race condition: We MUST assume the key selection was successful after triggering openSelectKey()
        // and proceed to the app. Do not add delay to mitigate the race condition.
      }
    }

    // 2. Initialize client with the (potentially new) key
    // Important: create a new instance to pick up the injected env var
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 3. Start generation
    // Enhanced prompt prefix for better aesthetics
    const enhancedPrompt = `Cinematic medical animation, 8k resolution, photorealistic textures, professional studio lighting, detailed anatomy, slow motion camera: ${prompt}`;
    
    console.log("Calling generateVideos with prompt:", enhancedPrompt);
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    console.log("Video operation started:", operation);

    // 4. Poll for completion
    while (!operation.done) {
      console.log("Polling for video completion...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // 5. Get result
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation completed but no URI was returned.");

    console.log("Video generated successfully:", videoUri);
    // Append key for playback access
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    const win = window as any;
    // Handle specific API errors that might indicate key issues
    if (error.message?.includes("Requested entity was not found") && win.aistudio && typeof win.aistudio.openSelectKey === 'function') {
      await win.aistudio.openSelectKey();
      throw new Error("API Key 可能无效或项目未开通权限，请重新选择");
    }
    throw error;
  }
};